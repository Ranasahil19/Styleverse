from flask import Flask, request, jsonify
import os
import cv2
import numpy as np
import mediapipe as mp
import base64
from flask_cors import CORS
import traceback
import math
import hashlib
from collections import OrderedDict
from rembg import remove
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
PORT = int(os.environ.get("PORT", 5001))
print(f"Running on port: {PORT}")

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# ── MediaPipe setup ──────────────────────────────────────────────────────────
mp_face_mesh = mp.solutions.face_mesh
mp_pose     = mp.solutions.pose
mp_selfie   = mp.solutions.selfie_segmentation

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False, max_num_faces=1,
    refine_landmarks=True, min_detection_confidence=0.5
)
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)
selfie_seg = mp_selfie.SelfieSegmentation(model_selection=1)
PRODUCT_CACHE_LIMIT = int(os.environ.get("TRYON_PRODUCT_CACHE_LIMIT", 24))
product_overlay_cache = OrderedDict()

# ── Helpers ──────────────────────────────────────────────────────────────────

def base64_to_image(b64: str) -> np.ndarray:
    data = base64.b64decode(b64.split(",")[-1])
    arr  = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)

def image_to_base64(img: np.ndarray) -> str:
    _, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode()

def remove_bg(img: np.ndarray) -> np.ndarray:
    """Remove background → BGRA with alpha channel."""
    result = remove(img)
    if result is None or result.size == 0:
        return img
    if result.shape[2] == 3:
        result = cv2.cvtColor(result, cv2.COLOR_BGR2BGRA)
    return result

def ensure_bgra(img: np.ndarray) -> np.ndarray:
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
    elif img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    return img

def trim_transparent_padding(img: np.ndarray, threshold: int = 12, pad: int = 4) -> np.ndarray:
    """Crop empty alpha padding so sizing is based on the actual product."""
    img = ensure_bgra(img)
    alpha = img[:, :, 3]
    ys, xs = np.where(alpha > threshold)
    if len(xs) == 0 or len(ys) == 0:
        return img

    h, w = img.shape[:2]
    x1 = max(int(xs.min()) - pad, 0)
    x2 = min(int(xs.max()) + pad + 1, w)
    y1 = max(int(ys.min()) - pad, 0)
    y2 = min(int(ys.max()) + pad + 1, h)
    return img[y1:y2, x1:x2]

def prepare_product_overlay(img: np.ndarray) -> np.ndarray:
    """Normalize product image alpha and remove unused canvas before fitting."""
    bgra = ensure_bgra(img.copy())
    alpha = bgra[:, :, 3]

    # Some catalogue images arrive as opaque PNG/JPEG on a white background.
    # If rembg did not produce meaningful alpha, infer it from non-white pixels.
    if np.mean(alpha > 250) > 0.98:
        bgr = bgra[:, :, :3]
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        distance_from_white = np.linalg.norm(255 - bgr.astype(np.int16), axis=2)
        inferred = ((distance_from_white > 34) | (hsv[:, :, 1] > 24)).astype(np.uint8) * 255
        inferred = cv2.medianBlur(inferred, 3)
        inferred = cv2.GaussianBlur(inferred, (3, 3), 0)
        bgra[:, :, 3] = inferred

    bgra[:, :, 3] = np.where(bgra[:, :, 3] < 10, 0, bgra[:, :, 3]).astype(np.uint8)
    return trim_transparent_padding(bgra)

def get_cached_product_overlay(product_b64: str) -> np.ndarray:
    """rembg is the slowest hosted step, so cache each product overlay per process."""
    product_key = hashlib.sha256(product_b64.encode("utf-8")).hexdigest()
    cached = product_overlay_cache.get(product_key)
    if cached is not None:
        product_overlay_cache.move_to_end(product_key)
        return cached.copy()

    product_img = base64_to_image(product_b64)
    product_img = remove_bg(product_img)
    product_img = prepare_product_overlay(product_img)

    product_overlay_cache[product_key] = product_img
    product_overlay_cache.move_to_end(product_key)
    while len(product_overlay_cache) > PRODUCT_CACHE_LIMIT:
        product_overlay_cache.popitem(last=False)

    return product_img.copy()

def prepare_glasses_overlay(img: np.ndarray, product_name: str = "") -> np.ndarray:
    """Keep clear eyeglass lenses transparent, but preserve sunglass lenses."""
    bgra = ensure_bgra(img.copy())
    alpha = bgra[:, :, 3]
    visible = alpha > 20
    if not np.any(visible):
        return bgra

    bgr = bgra[:, :, :3]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    text = (product_name or "").lower()

    visible_count = max(int(np.count_nonzero(visible)), 1)
    dark_ratio = np.count_nonzero((gray < 105) & visible) / visible_count
    sunglass_words = ("sun", "sunglass", "shade", "aviator")
    is_sunglasses = any(word in text for word in sunglass_words) or dark_ratio > 0.52

    if is_sunglasses:
        alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
        bgra[:, :, 3] = np.where(alpha < 8, 0, alpha).astype(np.uint8)
        return bgra

    # For normal eyeglasses, keep frames and fine edge details, not filled lenses.
    dark_frame = gray < 165
    colored_frame = hsv[:, :, 1] > 48
    edges = cv2.Canny(gray, 45, 125)
    edge_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    edges = cv2.dilate(edges, edge_kernel, iterations=1) > 0

    frame_mask = (visible & (dark_frame | colored_frame | edges)).astype(np.uint8) * 255
    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    frame_mask = cv2.morphologyEx(frame_mask, cv2.MORPH_CLOSE, close_kernel, iterations=1)
    frame_mask = cv2.GaussianBlur(frame_mask, (3, 3), 0)

    bgra[:, :, 3] = np.minimum(alpha, frame_mask).astype(np.uint8)
    return bgra

def rotate_image(img: np.ndarray, angle: float) -> np.ndarray:
    h, w = img.shape[:2]
    center = (w / 2, h / 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    cos = abs(M[0, 0])
    sin = abs(M[0, 1])
    new_w = int((h * sin) + (w * cos))
    new_h = int((h * cos) + (w * sin))
    M[0, 2] += (new_w / 2) - center[0]
    M[1, 2] += (new_h / 2) - center[1]
    return cv2.warpAffine(img, M, (new_w, new_h), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT,
                          borderValue=(0, 0, 0, 0))

def alpha_composite(base: np.ndarray, overlay: np.ndarray, x: int, y: int) -> np.ndarray:
    """Paste BGRA overlay onto BGRA base at (x, y) using proper alpha compositing."""
    ih, iw = base.shape[:2]
    oh, ow = overlay.shape[:2]

    # Clip to canvas
    x1, y1 = max(x, 0), max(y, 0)
    x2, y2 = min(x + ow, iw), min(y + oh, ih)
    if x2 <= x1 or y2 <= y1:
        return base

    ox1 = x1 - x
    oy1 = y1 - y
    ox2 = ox1 + (x2 - x1)
    oy2 = oy1 + (y2 - y1)

    fg  = overlay[oy1:oy2, ox1:ox2].astype(np.float32)
    bg  = base[y1:y2, x1:x2].astype(np.float32)
    a   = fg[:, :, 3:4] / 255.0

    composited = fg[:, :, :3] * a + bg[:, :, :3] * (1 - a)
    out = base.copy()
    out[y1:y2, x1:x2, :3] = np.clip(composited, 0, 255).astype(np.uint8)
    out[y1:y2, x1:x2,  3] = np.maximum(
        base[y1:y2, x1:x2, 3],
        overlay[oy1:oy2, ox1:ox2, 3]
    )
    return out

def clamp_float(value, default: float, min_value: float, max_value: float) -> float:
    try:
        value = float(value)
    except (TypeError, ValueError):
        return default
    return max(min_value, min(max_value, value))

def normalize_adjustments(adjustments: dict | None) -> dict:
    adjustments = adjustments or {}
    return {
        "scale": clamp_float(adjustments.get("scale"), 1.0, 0.65, 1.45),
        "offsetX": clamp_float(adjustments.get("offsetX"), 0.0, -0.35, 0.35),
        "offsetY": clamp_float(adjustments.get("offsetY"), 0.0, -0.35, 0.35),
    }

# ── Glasses ───────────────────────────────────────────────────────────────────

def overlay_glasses(user_img: np.ndarray, glasses_img: np.ndarray,
                    scale_factor: float = 1.46,
                    adjustments: dict | None = None,
                    product_name: str = "") -> np.ndarray:
    rgb    = cv2.cvtColor(user_img, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        return user_img

    lm = result.multi_face_landmarks[0].landmark
    ih, iw = user_img.shape[:2]
    fit = normalize_adjustments(adjustments)

    def pt(idx):
        return lm[idx].x * iw, lm[idx].y * ih

    def average_pt(indices):
        pts = [pt(idx) for idx in indices]
        return (
            sum(p[0] for p in pts) / len(pts),
            sum(p[1] for p in pts) / len(pts),
        )

    l_outer = pt(33)
    r_outer = pt(263)
    l_top = pt(159)
    r_top = pt(386)
    l_bot = pt(145)
    r_bot = pt(374)

    eye_span = math.dist(l_outer, r_outer)
    if eye_span <= 0:
        return user_img

    if len(lm) > 477:
        left_eye_center = average_pt([468, 469, 470, 471, 472])
        right_eye_center = average_pt([473, 474, 475, 476, 477])
    else:
        left_eye_center = ((l_top[0] + l_bot[0]) / 2, (l_top[1] + l_bot[1]) / 2)
        right_eye_center = ((r_top[0] + r_bot[0]) / 2, (r_top[1] + r_bot[1]) / 2)

    center_x = (left_eye_center[0] + right_eye_center[0]) / 2
    center_y = (left_eye_center[1] + right_eye_center[1]) / 2 - eye_span * 0.02
    center_x += eye_span * fit["offsetX"]
    center_y += eye_span * fit["offsetY"]

    dy = r_outer[1] - l_outer[1]
    dx = r_outer[0] - l_outer[0]
    angle = math.degrees(math.atan2(dy, dx))

    glasses = prepare_glasses_overlay(glasses_img, product_name)
    gh, gw = glasses.shape[:2]
    if gw == 0 or gh == 0:
        return user_img

    g_w = int(eye_span * scale_factor * fit["scale"])
    g_h = max(1, int(g_w * (gh / gw)))
    glasses = cv2.resize(glasses, (g_w, g_h), interpolation=cv2.INTER_LANCZOS4)
    glasses = rotate_image(glasses, angle)

    left_x = int(center_x - glasses.shape[1] / 2)
    top_y = int(center_y - glasses.shape[0] * 0.47)

    canvas = ensure_bgra(user_img.copy())
    canvas = alpha_composite(canvas, glasses, left_x, top_y)
    return cv2.cvtColor(canvas, cv2.COLOR_BGRA2BGR)

# ── Shirt / Clothing ──────────────────────────────────────────────────────────

def get_person_mask(user_img: np.ndarray) -> np.ndarray:
    """Use MediaPipe Selfie Segmentation to get person mask."""
    rgb    = cv2.cvtColor(user_img, cv2.COLOR_BGR2RGB)
    result = selfie_seg.process(rgb)
    mask   = (result.segmentation_mask > 0.5).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask   = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    return mask

def warp_shirt_to_body(shirt_bgra: np.ndarray,
                       src_pts: np.ndarray,
                       dst_pts: np.ndarray,
                       canvas_size: tuple) -> np.ndarray:
    """Warp shirt using perspective/affine transform based on body landmarks."""
    iw, ih = canvas_size
    M, _   = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC)
    if M is None:
        M = cv2.getAffineTransform(src_pts[:3].astype(np.float32),
                                   dst_pts[:3].astype(np.float32))
        warped = cv2.warpAffine(shirt_bgra, M, (iw, ih),
                                flags=cv2.INTER_LINEAR,
                                borderMode=cv2.BORDER_CONSTANT,
                                borderValue=(0, 0, 0, 0))
    else:
        warped = cv2.warpPerspective(shirt_bgra, M, (iw, ih),
                                     flags=cv2.INTER_LINEAR,
                                     borderMode=cv2.BORDER_CONSTANT,
                                     borderValue=(0, 0, 0, 0))
    return warped

def overlay_shirt(user_img: np.ndarray, shirt_img: np.ndarray,
                  scale_factor: float = 2.15,
                  vertical_offset: float = 0.05,
                  adjustments: dict | None = None) -> np.ndarray:
    ih, iw = user_img.shape[:2]
    rgb    = cv2.cvtColor(user_img, cv2.COLOR_BGR2RGB)
    result = pose.process(rgb)

    if not result.pose_landmarks:
        return user_img

    lm = result.pose_landmarks.landmark
    fit = normalize_adjustments(adjustments)

    def pt(idx):
        return [lm[idx].x * iw, lm[idx].y * ih]

    LS = mp_pose.PoseLandmark.LEFT_SHOULDER
    RS = mp_pose.PoseLandmark.RIGHT_SHOULDER
    LH = mp_pose.PoseLandmark.LEFT_HIP
    RH = mp_pose.PoseLandmark.RIGHT_HIP

    if lm[LS].visibility < 0.35 or lm[RS].visibility < 0.35:
        return user_img

    ls = pt(LS); rs = pt(RS)
    lh = pt(LH); rh = pt(RH)

    shoulder_w = math.dist(ls, rs)
    if shoulder_w <= 0:
        return user_img

    shoulder_mid = [(ls[0] + rs[0]) / 2, (ls[1] + rs[1]) / 2]
    hips_visible = lm[LH].visibility >= 0.25 and lm[RH].visibility >= 0.25
    hip_mid = [(lh[0] + rh[0]) / 2, (lh[1] + rh[1]) / 2] if hips_visible else [
        shoulder_mid[0],
        shoulder_mid[1] + shoulder_w * 1.35,
    ]

    torso_h = max(abs(hip_mid[1] - shoulder_mid[1]), shoulder_w * 1.20)
    top_width = min(iw * 1.18, shoulder_w * scale_factor * fit["scale"])
    bottom_width = top_width * 0.82
    top_y = shoulder_mid[1] - shoulder_w * (0.26 + vertical_offset) + shoulder_w * fit["offsetY"]
    bottom_y = min(ih + torso_h * 0.10, shoulder_mid[1] + torso_h * 1.18)

    shirt_bgra = ensure_bgra(shirt_img.copy())
    sh, sw = shirt_bgra.shape[:2]
    if sw == 0 or sh == 0:
        return user_img

    needed_h = top_width * (sh / sw) * 0.88
    if bottom_y - top_y < needed_h:
        bottom_y = min(ih + needed_h * 0.08, top_y + needed_h)

    offset_x = shoulder_w * fit["offsetX"]
    top_center_x = shoulder_mid[0] + offset_x
    bottom_center_x = shoulder_mid[0] * 0.65 + hip_mid[0] * 0.35 + offset_x

    top_left = [top_center_x - top_width / 2, top_y]
    top_right = [top_center_x + top_width / 2, top_y]
    bot_left = [bottom_center_x - bottom_width / 2, bottom_y]
    bot_right = [bottom_center_x + bottom_width / 2, bottom_y]

    # Source corners on the shirt image (matching topology)
    src_pts = np.array([
        [0,      0     ],   # top-left shoulder
        [sw,     0     ],   # top-right shoulder
        [sw,     sh    ],   # bottom-right hip
        [0,      sh    ],   # bottom-left hip
    ], dtype=np.float32)

    dst_pts = np.array([
        top_left, top_right, bot_right, bot_left
    ], dtype=np.float32)

    # ── Perspective warp ────────────────────────────────────────────────────
    M = cv2.getPerspectiveTransform(src_pts, dst_pts)
    warped = cv2.warpPerspective(shirt_bgra, M, (iw, ih),
                                  flags=cv2.INTER_LINEAR,
                                  borderMode=cv2.BORDER_CONSTANT,
                                  borderValue=(0, 0, 0, 0))

    # ── Alpha channel refinement ─────────────────────────────────────────────
    # Erode the edges slightly for a clean blend
    alpha = warped[:, :, 3]
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha  = cv2.erode(alpha, kernel, iterations=1)
    alpha  = cv2.GaussianBlur(alpha, (5, 5), 0)
    warped[:, :, 3] = alpha

    # ── Person mask: keep shirt only where person is ─────────────────────────
    person_mask = get_person_mask(user_img)
    # Dilate person mask a bit to avoid tight clipping
    kernel2     = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    person_mask = cv2.dilate(person_mask, kernel2, iterations=2)

    warped[:, :, 3] = cv2.bitwise_and(warped[:, :, 3], person_mask)

    # ── Composite shirt onto user image ──────────────────────────────────────
    canvas = ensure_bgra(user_img.copy())
    a      = warped[:, :, 3:4].astype(np.float32) / 255.0
    fg     = warped[:, :, :3].astype(np.float32)
    bg     = canvas[:, :, :3].astype(np.float32)

    blended             = fg * a + bg * (1 - a)
    canvas[:, :, :3]    = np.clip(blended, 0, 255).astype(np.uint8)

    return cv2.cvtColor(canvas, cv2.COLOR_BGRA2BGR)

# ── Routes ────────────────────────────────────────────────────────────────────

def process_tryon(data: dict) -> str:
    user_img    = base64_to_image(data["userImage"])
    product_img = get_cached_product_overlay(data["productImage"])
    adjustments = data.get("adjustments") or {}
    product_name = data.get("productName") or data.get("title") or ""

    cat = data.get("category", "").lower()
    if cat == "glasses":
        result = overlay_glasses(user_img, product_img, adjustments=adjustments, product_name=product_name)
    elif cat in ("men", "women", "shirt", "top"):
        result = overlay_shirt(user_img, product_img, adjustments=adjustments)
    else:
        raise ValueError(f"Unknown category: {cat}")

    return image_to_base64(result)

@app.route("/tryon", methods=["POST"])
def try_on():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ("userImage", "productImage", "category")):
            return jsonify({"error": "Missing required fields"}), 400
        return jsonify({"resultImage": process_tryon(data)}), 200
    except Exception as e:
        print("Error in /tryon:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@socketio.on("tryon_request")
def handle_tryon_request(data):
    try:
        emit("tryon_result", {"resultImage": process_tryon(data)})
    except Exception as e:
        print("Error in tryon_request:", e)
        emit("tryon_error", {"error": str(e)})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=PORT, debug=False)
