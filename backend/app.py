from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
import base64
from flask_cors import CORS
import traceback
from rembg import remove

app = Flask(__name__)
CORS(app, resources={r"/tryon": {"origins": "*"}})

# Initialize Mediapipe solutions
mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose
face_mesh = mp_face_mesh.FaceMesh()
pose = mp_pose.Pose()

def base64_to_image(base64_string, remove_bg=False):
    """Convert base64 string to OpenCV image."""
    img_data = base64.b64decode(base64_string.split(',')[-1])
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    
    if remove_bg:
        img = remove(img)
        img = cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGRA)
    
    return img

def image_to_base64(image):
    """Convert OpenCV image to base64 string."""
    _, buffer = cv2.imencode('.jpg', image)
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

def overlay_glasses(user_image, glasses_image, scale_factor=1.5):
    """AI-enhanced overlay for glasses with precise landmark fitting."""
    user_image_rgb = cv2.cvtColor(user_image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(user_image_rgb)
    
    if results.multi_face_landmarks:
        face_landmarks = results.multi_face_landmarks[0]
        ih, iw, _ = user_image.shape
        
        left_eye_inner = face_landmarks.landmark[133]
        right_eye_inner = face_landmarks.landmark[362]
        left_eye_outer = face_landmarks.landmark[33]
        right_eye_outer = face_landmarks.landmark[263]
        eye_center = face_landmarks.landmark[168]
        
        eye_width = (right_eye_outer.x - left_eye_outer.x) * iw
        new_left_x = int((left_eye_inner.x * iw) - (eye_width * (scale_factor - 1) / 2))
        new_right_x = int((right_eye_inner.x * iw) + (eye_width * (scale_factor - 1) / 2))
        
        top_y = int(eye_center.y * ih - (eye_width * 0.3))
        bottom_y = int(eye_center.y * ih + (eye_width * 0.3))
        
        glasses_width = new_right_x - new_left_x
        glasses_height = bottom_y - top_y
        resized_glasses = cv2.resize(glasses_image, (glasses_width, glasses_height))
        
        if resized_glasses.shape[2] == 3:
            resized_glasses = cv2.cvtColor(resized_glasses, cv2.COLOR_BGR2BGRA)
        
        overlay_image(user_image, resized_glasses, new_left_x, top_y)
    
    return user_image

def overlay_shirt(user_image, shirt_image, scale_factor=1.4, height_adjust=0.1, sleeve_lift_factor=0.7):
    """Overlay a shirt on a user while tracking arm movement and moving sleeves."""
    user_image_rgb = cv2.cvtColor(user_image, cv2.COLOR_BGR2RGB)
    results = pose.process(user_image_rgb)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
        left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
        right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
        left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW]
        right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]

        ih, iw, _ = user_image.shape
        
        # Shirt width based on shoulder distance
        shoulder_distance = (right_shoulder.x - left_shoulder.x) * iw
        new_left_x = int((left_shoulder.x * iw) - (shoulder_distance * (scale_factor - 1) / 2))
        new_right_x = int((right_shoulder.x * iw) + (shoulder_distance * (scale_factor - 1) / 2))
        
        # Determine shirt height dynamically based on hip position
        top_y = int(min(left_shoulder.y, right_shoulder.y) * ih - (height_adjust * ih))
        bottom_y = int(max(left_hip.y, right_hip.y) * ih + (height_adjust * ih * 2))

        # Adjust sleeve movement
        left_arm_up = left_wrist.y < left_elbow.y  # If wrist is above elbow
        right_arm_up = right_wrist.y < right_elbow.y

        sleeve_movement_left = int((left_elbow.y - left_wrist.y) * ih * sleeve_lift_factor) if left_arm_up else 0
        sleeve_movement_right = int((right_elbow.y - right_wrist.y) * ih * sleeve_lift_factor) if right_arm_up else 0

        # Resize and warp shirt
        shirt_width = new_right_x - new_left_x
        shirt_height = bottom_y - top_y
        resized_shirt = cv2.resize(shirt_image, (shirt_width, shirt_height), interpolation=cv2.INTER_AREA)

        # Convert shirt to BGRA if needed
        if resized_shirt.shape[2] == 3:
            resized_shirt = cv2.cvtColor(resized_shirt, cv2.COLOR_BGR2BGRA)

        # Ensure user image is BGRA
        if user_image.shape[2] == 3:
            user_image = cv2.cvtColor(user_image, cv2.COLOR_BGR2BGRA)

        # Create a mask for overlay
        shirt_alpha = resized_shirt[:, :, 3] / 255.0
        user_alpha = 1.0 - shirt_alpha

        # Move sleeves by adjusting the upper part of the shirt
        sleeve_adjustment = np.zeros_like(resized_shirt[:, :, :3], dtype=np.uint8)
        
        # Left sleeve movement
        if left_arm_up:
            sleeve_adjustment[:sleeve_movement_left, :shirt_width//2] = resized_shirt[:sleeve_movement_left, :shirt_width//2]

        # Right sleeve movement
        if right_arm_up:
            sleeve_adjustment[:sleeve_movement_right, shirt_width//2:] = resized_shirt[:sleeve_movement_right, shirt_width//2:]

        # Blend sleeve movement with the main shirt
        resized_shirt[:sleeve_movement_left, :shirt_width//2] = sleeve_adjustment[:sleeve_movement_left, :shirt_width//2]
        resized_shirt[:sleeve_movement_right, shirt_width//2:] = sleeve_adjustment[:sleeve_movement_right, shirt_width//2:]

        # Overlay shirt onto user
        for c in range(0, 3):
            user_image[top_y:bottom_y, new_left_x:new_right_x, c] = (
                shirt_alpha * resized_shirt[:, :, c] +
                user_alpha * user_image[top_y:bottom_y, new_left_x:new_right_x, c]
            )

        # Convert back to BGR
        final_image = cv2.cvtColor(user_image, cv2.COLOR_BGRA2BGR)
        
        return final_image

    return user_image


def overlay_image(background, overlay, x, y):
    """General function to overlay transparent images on a background."""
    h, w, _ = overlay.shape
    alpha = overlay[:, :, 3] / 255.0
    for c in range(3):
        background[y:y+h, x:x+w, c] = (
            alpha * overlay[:, :, c] + (1 - alpha) * background[y:y+h, x:x+w, c]
        )

@app.route('/tryon', methods=['POST'])
def try_on():
    try:
        data = request.get_json()
        if not data or 'userImage' not in data or 'productImage' not in data or 'category' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_image = base64_to_image(data['userImage'])
        product_image = base64_to_image(data['productImage'], remove_bg=True)
        
        if data['category'] == "glasses":
            result_image = overlay_glasses(user_image, product_image)
        elif data['category'] == "men":
            result_image = overlay_shirt(user_image, product_image)
        else:
            return jsonify({'error': 'Invalid category'}), 400
        
        result_base64 = image_to_base64(result_image)
        return jsonify({'resultImage': result_base64}), 200
    
    except Exception as e:
        print("Error in /tryon:", e)
        print(traceback.format_exc()) 
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
