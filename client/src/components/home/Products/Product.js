import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import {
  IoClose,
  IoCameraOutline,
  IoCloudUploadOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, addToWishlist, removeFromWishList } from "../../../redux/orebiSlice";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { CartPopup, PopupMsg } from "../../popup/PopupMsg";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config/ApiConfig";

// ─── Shared socket singleton ─────────────────────────────────────────────────
let sharedSocket = null;
function getSocket() {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(API_BASE_URL, { transports: ["websocket"] });
  }
  return sharedSocket;
}

const apiUrl = (path) =>
  `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

// ─── TryOn Modal ─────────────────────────────────────────────────────────────
function TryOnModal({ product, onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const intervalRef = useRef(null);
  const requestTimeoutRef = useRef(null);
  const socketRef  = useRef(null);
  const inFlightRef = useRef(false);
  const productB64Ref = useRef(null);

  const [stream,      setStream]      = useState(null);
  const [resultImg,   setResultImg]   = useState(null);
  const [status,      setStatus]      = useState("idle"); // idle | loading | ready | error
  const [camError,    setCamError]    = useState(false);
  const [productReady, setProductReady] = useState(false);
  const [fps,         setFps]         = useState(0);
  const fpsRef = useRef({ count: 0, last: Date.now() });

  // ── Start camera ────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        });
        if (!mounted) { s.getTracks().forEach(t => t.stop()); return; }
        if (videoRef.current) videoRef.current.srcObject = s;
        setStream(s);
      } catch {
        setCamError(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Load product image once ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    productB64Ref.current = null;
    setProductReady(false);

    (async () => {
      try {
        const resp = await fetch(product.image, { cache: "force-cache" });
        const blob = await resp.blob();
        const prodB64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });

        if (!cancelled) {
          productB64Ref.current = prodB64;
          setProductReady(true);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [product.image]);

  // ── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const sock = getSocket();
    socketRef.current = sock;

    const onResult = (data) => {
      inFlightRef.current = false;
      clearTimeout(requestTimeoutRef.current);

      if (data.resultImage) {
        setResultImg(data.resultImage);
        setStatus("ready");
        // FPS counter
        fpsRef.current.count++;
        const now = Date.now();
        if (now - fpsRef.current.last >= 1000) {
          setFps(fpsRef.current.count);
          fpsRef.current = { count: 0, last: now };
        }
      }
    };
    const onError = () => {
      inFlightRef.current = false;
      clearTimeout(requestTimeoutRef.current);
      setStatus("error");
    };

    sock.on("tryon_result", onResult);
    sock.on("tryon_error",  onError);
    return () => {
      clearTimeout(requestTimeoutRef.current);
      sock.off("tryon_result", onResult);
      sock.off("tryon_error",  onError);
    };
  }, []);

  // ── Frame processing ─────────────────────────────────────────────────────
  const processFrame = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (
      inFlightRef.current ||
      !productB64Ref.current ||
      !video ||
      !canvas ||
      !video.srcObject ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    ) return;

    const targetWidth = Math.min(480, video.videoWidth);
    const targetHeight = Math.round((video.videoHeight / video.videoWidth) * targetWidth);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, targetWidth, targetHeight);

    const userB64 = canvas.toDataURL("image/jpeg", 0.6);
    if (userB64 === "data:,") return;

    try {
      inFlightRef.current = true;
      setStatus(prev => prev === "ready" ? prev : "loading");

      socketRef.current?.emit("tryon_request", {
        userImage:    userB64,
        productImage: productB64Ref.current,
        category:     product.category,
        productName:  product.title,
      });

      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = setTimeout(() => {
        inFlightRef.current = false;
        setStatus(prev => (prev === "loading" ? "error" : prev));
      }, 45000);
    } catch {
      inFlightRef.current = false;
      setStatus("error");
    }
  }, [product.category, product.title]);

  useEffect(() => {
    if (!stream || !productReady) return;
    // Wait for video to be ready
    const v = videoRef.current;
    const start = () => {
      processFrame();
      intervalRef.current = setInterval(processFrame, 4000);
    };
    if (v?.readyState >= 2) {
      start();
    } else {
      v?.addEventListener("playing", start, { once: true });
    }
    return () => {
      clearInterval(intervalRef.current);
      v?.removeEventListener("playing", start);
    };
  }, [stream, productReady, processFrame]);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(requestTimeoutRef.current);
      inFlightRef.current = false;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  return (
    <div
      className="tryon-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={backdropStyle}
    >
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HiSparkles style={{ color: "#6C63FF", fontSize: "22px" }} />
            <span style={titleStyle}>Try-On</span>
            {status === "ready" && fps > 0 && (
              <span style={fpsBadge}>{fps} FPS</span>
            )}
          </div>
          <button onClick={onClose} style={closeBtn} title="Close">
            <IoClose />
          </button>
        </div>

        {/* Product info strip */}
        <div style={productStrip}>
          <img src={product.image} alt={product.title} style={productThumb} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a1a" }}>
              {product.title?.slice(0, 30)}...
            </div>
            <div style={{ fontSize: "12px", color: "#6C63FF", fontWeight: 700 }}>
              ${product.price}
            </div>
          </div>
        </div>

        {/* Camera error */}
        {camError && (
          <div style={errorBox}>
            📷 Camera access denied. Please allow camera permissions and reload.
          </div>
        )}

        {/* Main view area */}
        <div style={viewArea}>
          {/* Live feed */}
          <div style={feedCol}>
            <div style={labelTag}>📹 Live Camera</div>
            <div style={videoWrap}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={videoStyle}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {/* Scan line overlay */}
              <div style={scanLine} />
            </div>
          </div>

          {/* Arrow */}
          <div style={arrowDiv}>
            {status === "loading" ? (
              <div style={spinner} />
            ) : (
              <span style={{ fontSize: "28px", color: "#6C63FF" }}>→</span>
            )}
          </div>

          {/* Try-on result */}
          <div style={feedCol}>
            <div style={labelTag}>
              {status === "ready" ? "✨ Try-On Result" : "⏳ Processing..."}
            </div>
            <div style={{ ...videoWrap, background: resultImg ? "transparent" : "#f0eeff" }}>
              {resultImg ? (
                <img
                  src={resultImg}
                  alt="Try-on result"
                  style={videoStyle}
                />
              ) : (
                <div style={placeholderBox}>
                  <IoCameraOutline style={{ fontSize: 48, color: "#c0baf0" }} />
                  <p style={{ color: "#a09fba", fontSize: 13, marginTop: 8 }}>
                    {!productReady
                      ? "Preparing product..."
                      : status === "loading"
                      ? "Fitting item..."
                      : status === "error"
                      ? "Try-on is taking longer. Refresh to retry."
                      : "Result will appear here"}
                  </p>
                  {(status === "loading" || !productReady) && <div style={linearProgress} />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={statusBar}>
          <div style={{ ...statusDot, background: stream ? "#22c55e" : "#ef4444" }} />
          <span style={{ fontSize: 12, color: "#555" }}>
            {stream ? "Camera active" : "Camera off"}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#999" }}>
            {status === "ready"
              ? "✅ Try-on live"
              : !productReady
              ? "Preparing product image..."
              : status === "loading"
              ? "🔄 Processing frame…"
              : status === "error"
              ? "❌ Slow response — retry"
              : "Waiting for camera…"}
          </span>
        </div>

        {/* Actions */}
        <div style={actionsRow}>
          <button onClick={onClose} style={cancelBtn}>
            Close
          </button>
          {resultImg && (
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = resultImg;
                a.download = "tryon-result.jpg";
                a.click();
              }}
              style={downloadBtn}
            >
              💾 Save Photo
            </button>
          )}
          <button
            onClick={() => {
              clearTimeout(requestTimeoutRef.current);
              inFlightRef.current = false;
              setResultImg(null);
              setStatus(productReady ? "loading" : "idle");
              processFrame();
            }}
            style={refreshBtn}
            title="Reset"
          >
            <IoRefreshOutline style={{ marginRight: 4 }} /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

function AiTryOnModal({ product, onClose }) {
  const [userImage, setUserImage] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const loadFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImage(reader.result);
      setResultImg(null);
      setStatus("idle");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const getProductBase64 = async () => {
    const response = await fetch(product.image, { cache: "force-cache" });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateAiTryOn = async () => {
    if (!userImage || status === "loading") return;

    try {
      setStatus("loading");
      setError("");
      const productImage = await getProductBase64();
      const response = await axios.post(apiUrl("/api/ai-tryon"), {
        userImage,
        productImage,
        category: product.category,
        productName: product.title,
      });

      setResultImg(response.data.resultImage);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      const code = err.response?.data?.code;
      const apiError = err.response?.data?.error;
      setError(
        code === "GEMINI_QUOTA_EXCEEDED"
          ? "Gemini image generation quota was reached. Please wait for the quota to reset, then try again."
          : apiError || "AI try-on failed. Please try again."
      );
    }
  };

  return (
    <div
      className="tryon-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={backdropStyle}
    >
      <div style={aiModalStyle}>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HiSparkles style={{ color: "#6C63FF", fontSize: "22px" }} />
            <span style={titleStyle}>AI Try-On</span>
          </div>
          <button onClick={onClose} style={closeBtn} title="Close">
            <IoClose />
          </button>
        </div>

        <div style={productStrip}>
          <img src={product.image} alt={product.title} style={productThumb} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a1a" }}>
              {product.title?.slice(0, 30)}...
            </div>
            <div style={{ fontSize: "12px", color: "#6C63FF", fontWeight: 700 }}>
              {product.category}
            </div>
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <div style={aiGrid}>
          <div style={feedCol}>
            <div style={labelTag}>Your Photo</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={uploadBox}
            >
              {userImage ? (
                <img src={userImage} alt="Selected user" style={userPreviewImage} />
              ) : (
                <div style={placeholderBox}>
                  <IoCloudUploadOutline style={{ fontSize: 48, color: "#c0baf0" }} />
                  <p style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>
                    Upload clear front photo
                  </p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => loadFile(e.target.files?.[0])}
              style={{ display: "none" }}
            />
          </div>

          <div style={feedCol}>
            <div style={labelTag}>Selected Product</div>
            <div style={aiPreviewBox}>
              <img src={product.image} alt={product.title} style={productPreviewImage} />
            </div>
          </div>

          <div style={feedCol}>
            <div style={labelTag}>AI Result</div>
            <div style={aiPreviewBox}>
              {resultImg ? (
                <img src={resultImg} alt="AI try-on result" style={resultPreviewImage} />
              ) : status === "loading" ? (
                <div style={loadingResultBox}>
                  <div style={loadingImageFrame}>
                    <div style={spinner} />
                    <div style={scanLine} />
                  </div>
                  <p style={loadingTitle}>Generating try-on</p>
                  <p style={loadingText}>Fitting the product to your photo...</p>
                  <div style={linearProgress}>
                    <div style={linearProgressFill} />
                  </div>
                </div>
              ) : (
                <div style={placeholderBox}>
                  <HiSparkles style={{ fontSize: 48, color: "#c0baf0" }} />
                  <p style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>
                    AI result appears here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={actionsRow}>
          <button onClick={onClose} style={cancelBtn}>
            Close
          </button>
          <button
            onClick={generateAiTryOn}
            disabled={!userImage || status === "loading"}
            style={{
              ...downloadBtn,
              opacity: !userImage || status === "loading" ? 0.55 : 1,
              cursor: !userImage || status === "loading" ? "not-allowed" : "pointer",
            }}
          >
            {status === "loading" ? "Generating..." : "Get AI Try-On"}
          </button>
          {resultImg && (
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = resultImg;
                a.download = "ai-tryon-result.png";
                a.click();
              }}
              style={refreshBtn}
            >
              Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
const Product = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state }       = useContext(AuthContext);
  const { isLoggedIn, user } = state;
  const [tryOnOpen,   setTryOnOpen]   = useState(false);
  const [aiTryOnOpen, setAiTryOnOpen] = useState(false);
  const [showPopup,   setShowPopup]   = useState(false);
  const [popup,       setPopup]       = useState({ message: "", type: "", show: false });

  const wishlistProducts = useSelector((s) => s.orebiReducer?.wishlistProducts || []);
  const inWishlist = wishlistProducts.some((i) => i._id === props._id);

  const productInfo = props;

  const handleProductDetails = () =>
    navigate(`/products/${props._id}`, { state: { item: productInfo } });

  const handleAddToCart = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cart`, {
        productId: props._id, quantity: 1, userId: user.userId,
      });
      if (res.data.success) {
        dispatch(addToCart({
          _id: props._id, name: props.title, quantity: 1,
          image: props.image, badge: props.badge, price: props.price, colors: props.color,
        }));
        setShowPopup(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) return alert("Please log in to manage your wishlist.");
    try {
      if (inWishlist) {
        const res = await axios.post(`${API_BASE_URL}/wishlist/remove`,
          { productId: props._id, userId: user.userId }, { withCredentials: true });
        if (res.data.success) {
          dispatch(removeFromWishList(props._id));
          setPopup({ message: "Removed from wishlist", type: "success", show: true });
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/wishlist/add`,
          { productId: props._id, userId: user.userId }, { withCredentials: true });
        if (res.data.success) {
          dispatch(addToWishlist(props));
          setPopup({ message: "Added to wishlist", type: "success", show: true });
        }
      }
    } catch {
      setPopup({ message: "Wishlist error", type: "error", show: true });
    }
  };

  return (
    <>
      <div className="product-card group relative flex h-full w-full flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative overflow-hidden rounded-lg bg-gray-50">
          <img
            className="h-64 w-full cursor-pointer rounded-lg object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            src={props.image}
            alt={props.title}
            onClick={handleProductDetails}
          />

          {/* Badge */}
          {props.badge && (
            <div className="absolute top-3 left-3">
              <span className="bg-violet-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {props.badge}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-end justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-lg p-3 gap-2">
            <button
              onClick={() => setTryOnOpen(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow transition"
            >
              <HiSparkles />Try-On
            </button>
            <button
              onClick={() => setAiTryOnOpen(true)}
              className="flex items-center gap-2 bg-white/90 hover:bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition"
            >
              <HiSparkles /> AI Try-On
            </button>
            <button
              onClick={handleProductDetails}
              className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition"
            >
              <MdOutlineLabelImportant /> Details
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-white/90 hover:bg-green-50 text-gray-800 hover:text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition"
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition ${
                inWishlist
                  ? "bg-pink-100 text-pink-600"
                  : "bg-white/90 text-gray-800 hover:text-pink-600"
              }`}
            >
              <BsSuitHeartFill /> {inWishlist ? "Wishlisted" : "Wishlist"}
            </button>
          </div>
        </div>

        {/* Product info */}
        <div
          className="flex min-h-[72px] flex-col justify-end pb-1 pt-4 cursor-pointer"
          onClick={handleProductDetails}
        >
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {props.title}
          </h2>
          <p className="text-sm font-bold text-violet-600 mt-0.5">${props.price}</p>
        </div>
      </div>

      {/* Popups */}
      {showPopup && (
        <CartPopup productInfo={productInfo} qty={1} setShowPopup={setShowPopup} />
      )}
      {popup.show && <PopupMsg message={popup.message} type={popup.type} />}

      {/* Try-On Modal */}
      {tryOnOpen && (
        <TryOnModal
          product={props}
          onClose={() => setTryOnOpen(false)}
        />
      )}
      {aiTryOnOpen && (
        <AiTryOnModal
          product={props}
          onClose={() => setAiTryOnOpen(false)}
        />
      )}
    </>
  );
};

export default Product;

// ─── Inline styles (scoped to modal) ─────────────────────────────────────────
const backdropStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999, padding: "16px",
};

const modalStyle = {
  background: "#fff",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "860px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 25px 60px rgba(108,99,255,0.2)",
  display: "flex",
  flexDirection: "column",
  gap: "0",
};

const aiModalStyle = {
  ...modalStyle,
  maxWidth: "1040px",
};

const headerStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "18px 24px 14px",
  borderBottom: "1px solid #f0f0f0",
};

const titleStyle = {
  fontSize: "18px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.3px",
};

const fpsBadge = {
  fontSize: "11px", fontWeight: 700,
  background: "#e8f5e9", color: "#22c55e",
  padding: "2px 8px", borderRadius: "999px",
};

const closeBtn = {
  background: "#f5f5f5", border: "none", borderRadius: "50%",
  width: 36, height: 36, display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: 20, cursor: "pointer", color: "#555",
};

const productStrip = {
  display: "flex", alignItems: "center", gap: "12px",
  padding: "10px 24px",
  background: "#faf9ff",
  borderBottom: "1px solid #f0eeff",
};

const productThumb = {
  width: 42, height: 42, borderRadius: 10,
  objectFit: "cover", border: "2px solid #e8e4ff",
};

const errorBox = {
  margin: "16px 24px",
  padding: "12px 16px",
  background: "#fff1f2", border: "1px solid #fecdd3",
  borderRadius: 10, color: "#be123c", fontSize: 13,
};

const viewArea = {
  display: "flex", alignItems: "center", gap: "16px",
  padding: "20px 24px",
};

const aiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  padding: "20px 24px",
};

const feedCol = { flex: 1, display: "flex", flexDirection: "column", gap: "8px" };

const labelTag = {
  fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px",
  color: "#6C63FF", textTransform: "uppercase",
};

const videoWrap = {
  position: "relative",
  borderRadius: "14px",
  overflow: "hidden",
  background: "#111",
  aspectRatio: "4/3",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "2px solid #ede9ff",
};

const aiPreviewBox = {
  ...videoWrap,
  background: "#fafafa",
};

const uploadBox = {
  ...videoWrap,
  width: "100%",
  cursor: "pointer",
  borderStyle: "dashed",
  padding: 0,
};

const videoStyle = {
  width: "100%", height: "100%",
  objectFit: "cover",
  display: "block",
};

const userPreviewImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  display: "block",
  background: "#050505",
};

const resultPreviewImage = {
  ...userPreviewImage,
};

const productPreviewImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: "18px",
  display: "block",
};

const scanLine = {
  position: "absolute", top: 0, left: 0, right: 0,
  height: "2px",
  background: "linear-gradient(90deg, transparent, #6C63FF, transparent)",
  animation: "scanAnim 2s linear infinite",
  opacity: 0.7,
};

const placeholderBox = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  padding: "20px", textAlign: "center", width: "100%",
};

const loadingResultBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  padding: "22px",
  textAlign: "center",
  background: "linear-gradient(180deg, #fbfaff 0%, #ffffff 100%)",
};

const loadingImageFrame = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 68,
  height: 68,
  borderRadius: 14,
  background: "#f3f0ff",
  border: "1px solid #e6e0ff",
  overflow: "hidden",
};

const loadingTitle = {
  marginTop: 14,
  marginBottom: 0,
  color: "#1f2937",
  fontSize: 14,
  fontWeight: 700,
};

const loadingText = {
  marginTop: 5,
  marginBottom: 0,
  color: "#6b7280",
  fontSize: 12,
  lineHeight: 1.4,
};

const linearProgress = {
  marginTop: "12px", width: "80%", height: "3px",
  background: "#e8e4ff", borderRadius: "99px",
  overflow: "hidden",
  position: "relative",
};

const linearProgressFill = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  width: "45%",
  borderRadius: "99px",
  background: "linear-gradient(90deg, #6C63FF, #a78bfa)",
  animation: "progressSlide 1.2s ease-in-out infinite",
};

const arrowDiv = {
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0, width: 40,
};

const spinner = {
  width: 28, height: 28,
  border: "3px solid #e8e4ff",
  borderTop: "3px solid #6C63FF",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const statusBar = {
  display: "flex", alignItems: "center", gap: "8px",
  padding: "10px 24px",
  background: "#fafafa",
  borderTop: "1px solid #f0f0f0",
};

const statusDot = {
  width: 8, height: 8, borderRadius: "50%",
};

const actionsRow = {
  display: "flex", alignItems: "center", gap: "10px",
  padding: "16px 24px",
  borderTop: "1px solid #f0f0f0",
  flexWrap: "wrap",
};

const cancelBtn = {
  padding: "9px 20px", borderRadius: "10px",
  border: "1.5px solid #e0e0e0", background: "white",
  fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#555",
};

const downloadBtn = {
  padding: "9px 20px", borderRadius: "10px",
  border: "none", background: "#6C63FF",
  fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "white",
};

const refreshBtn = {
  display: "flex", alignItems: "center",
  padding: "9px 20px", borderRadius: "10px",
  border: "1.5px solid #e8e4ff", background: "#faf9ff",
  fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#6C63FF",
  marginLeft: "auto",
};

// ── Keyframes (injected once) ─────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("tryon-keyframes")) {
  const style = document.createElement("style");
  style.id = "tryon-keyframes";
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scanAnim {
      0%   { transform: translateY(0); }
      100% { transform: translateY(300px); }
    }
    @keyframes progressSlide {
      0%   { transform: translateX(-110%); }
      100% { transform: translateX(230%); }
    }
  `;
  document.head.appendChild(style);
}
