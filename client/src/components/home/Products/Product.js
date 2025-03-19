// import React, { useContext, useEffect, useRef, useState } from "react";
// import { BsSuitHeartFill } from "react-icons/bs";
// import { GiReturnArrow } from "react-icons/gi";
// import { FaShoppingCart } from "react-icons/fa";
// import { MdOutlineLabelImportant } from "react-icons/md";
// import Image from "../../designLayouts/Image";
// import Badge from "./Badge";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addToCart } from "../../../redux/orebiSlice";
// import axios from "axios";
// import { AuthContext } from "../../../context/AuthContext";
// import { CartPopup } from "../../popup/PopupMsg";

// const Product = (props) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { state } = useContext(AuthContext);
//   const { isLoggedIn, user } = state;
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [videoStream, setVideoStream] = useState(null);
//   const [tryOnImage, setTryOnImage] = useState(null);
//   const productInfo = props;
//   const [showPopup, setShowPopup] = useState(false);

//   const handleProductDetails = () => {
//     navigate(`/products/${props._id}`, {
//       state: {
//         item: productInfo,
//       },
//     });
//   };

//   const handleAddToCart = async () => {
//     try {
//       const response = await axios.post("http://localhost:5000/api/cart", {
//         productId: props._id,
//         quantity: 1,
//         userId: user.userId,
//       });
//       if (response.data.success) {
//         console.log("Cart item saved to MongoDB:", response.data.cartItem);
//         dispatch(
//           addToCart({
//             _id: props._id,
//             name: props.title,
//             quantity: 1,
//             image: props.image,
//             badge: props.badge,
//             price: props.price,
//             colors: props.color,
//           })
//         );
//         setShowPopup(true); // Show the CartPopup
//       }
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       setVideoStream(stream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error("Error accessing the camera:", err);
//     }
//   };

//   const clearCanvas = () => {
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext("2d");
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//   };

//   const stopTryOn = () => {
//     if (videoRef.current) {
//       const stream = videoRef.current.srcObject;
//       if (stream) {
//         const tracks = stream.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//       videoRef.current.srcObject = null;
//     }
//     clearCanvas(); // Clear the canvas when stopping try-on
//     setTryOnImage(null);
//     setVideoStream(null);
//   };

//   const getBase64FromUrl = async (imageUrl) => {
//     const response = await fetch(imageUrl);
//     const blob = await response.blob();
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.readAsDataURL(blob);
//     });
//   };
  
//   const processFrame = async () => {
//     if (!videoRef.current || !canvasRef.current) return;
  
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const video = videoRef.current;
  
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
//     const userImageBase64 = canvas.toDataURL("image/jpeg");
  
//     try {
//       const productImageBase64 = await getBase64FromUrl(props.image); // Convert image URL to Base64
  
//       const response = await axios.post("http://127.0.0.1:5000/tryon", {
//         userImage: userImageBase64,
//         productImage: productImageBase64,
//         category: props.category, // or "men"
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
  
//       if (response.data.resultImage) {
//         setTryOnImage(response.data.resultImage);
//       }
//     } catch (error) {
//       console.error("Error with virtual try-on:", error);
//     }
//   };
  
//   // Process a frame every second when the camera is running
//   useEffect(() => {
//     let interval;
//     if (videoStream) {
//       interval = setInterval(processFrame, 1000);
//     }
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [videoStream]);

//   return (
//     <div className="w-full relative group border-[1px] p-4 hover:shadow-lg transition-shadow duration-300">
//       <div className="max-w-80 relative overflow-hidden">
//         {/* Product Image */}
//         <div>
//           <img className="w-full h-52" src={props.image} alt="Product" />
//         </div>
        
//         {/* Badge */}
//         <div className="absolute top-6 left-8">
//           {props.badge && <Badge text={props.badge} />}
//         </div>
  
//         {/* Interactive Buttons - Appear on Hover */}
//         <div className="w-full h-36 absolute bg-white -bottom-[135px] group-hover:bottom-0 duration-700">
//         <ul className="w-full h-full flex flex-col items-end justify-center gap-2 font-titleFont px-2 border-l border-r">
//             <li
//               onClick={startCamera}
//               className="text-[#767676] hover:text-primeColor text-sm font-normal flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
//             >
//               Start Try On <GiReturnArrow />
//             </li>
//             <li
//               onClick={stopTryOn}
//               className="text-[#767676] hover:text-primeColor text-sm font-normal flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
//             >
//               Stop Try On <GiReturnArrow />
//             </li>
//             <li
//               onClick={handleAddToCart}
//               className="text-[#767676] hover:text-primeColor text-sm font-normal flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
//             >
//               Add to Cart <FaShoppingCart />
//             </li>
//             <li
//               onClick={handleProductDetails}
//               className="text-[#767676] hover:text-primeColor text-sm font-normal flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
//             >
//               View Details <MdOutlineLabelImportant />
//             </li>
//             <li className="text-[#767676] hover:text-primeColor text-sm font-normal flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full">
//               Add to Wish List <BsSuitHeartFill />
//             </li>
//           </ul>
//         </div>
//       </div>
  
//       {/* Product Details - Title, Price, Color */}
//       <div className="py-4 flex flex-col gap-1 px-2 text-center">
//         <h2 className="text-lg text-primeColor font-bold">
//           {props.title.slice(0, 20)}...
//         </h2>
//         <p className="text-[#767676] text-[14px]">${props.price}</p>
//         <p className="text-[#767676] text-[14px]">{props.color}</p>
//       </div>
  
//       {/* Cart Popup */}
//       {showPopup && (
//         <CartPopup productInfo={productInfo} qty={1} setShowPopup={setShowPopup} />
//       )}
  
//       {/* Virtual Try-On Elements */}
//       {videoStream && (
//         <div>
//           <video ref={videoRef} width="400" height="300" autoPlay playsInline />
//           <canvas ref={canvasRef} style={{ display: "none" }} />
//         </div>
//       )}
//       {tryOnImage && (
//         <img
//           src={tryOnImage}
//           alt="Live Try-On Result"
//           className="mt-4"
//           style={{ width: "300px", height: "auto" }}
//         />
//       )}
//     </div>
//   );
  
// };

// export default Product;

import React, { useContext, useEffect, useRef, useState } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { GiReturnArrow } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import Image from "../../designLayouts/Image";
import Badge from "./Badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, addToWishlist, removeFromWishList } from "../../../redux/orebiSlice";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { CartPopup } from "../../popup/PopupMsg";
import { io } from "socket.io-client";

const Product = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const { isLoggedIn, user } = state;
  const [videoStream, setVideoStream] = useState(null);
  const [tryOnImage, setTryOnImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const productInfo = props;
  const [showPopup, setShowPopup] = useState(false);
  const wishlistProducts = useSelector((state) => state.orebiReducer?.wishlistProducts || []);
  let tryOnSocket;
  const startTryOnSocket = () => {
    if (!tryOnSocket) {
      tryOnSocket = io("http://127.0.0.1:5000");
    }
  };

  const handleProductDetails = () => {
    navigate(`/products/${props._id}`, {
      state: { item: productInfo },
    });
  };
  
  const handleAddToCart = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/cart", {
        productId: props._id,
        quantity: 1,
        userId: user.userId,
      });
      if (response.data.success) {
        dispatch(
          addToCart({
            _id: props._id,
            name: props.title,
            quantity: 1,
            image: props.image,
            badge: props.badge,
            price: props.price,
            colors: props.color,
          })
        );
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const startCamera = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoStream(stream);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const stopTryOn = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    clearCanvas();
    setTryOnImage(null);
    setVideoStream(null);
    setIsOpen(false);
  };

  const getBase64FromUrl = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.srcObject) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (video.readyState < 2) {
      console.warn("Video not ready");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const userImageBase64 = canvas.toDataURL("image/jpeg");
    if (userImageBase64 === "data:,") {
      console.error("Captured image is empty. Check if video is playing.");
      return;
    }

    try {
      startTryOnSocket()
      const productImageBase64 = await getBase64FromUrl(props.image);
      tryOnSocket.emit("tryon_request", {
        userImage: userImageBase64,
        productImage: productImageBase64,
        category: props.category,
      });

      tryOnSocket.on("tryon_result", (data) => {
        if (data.resultImage) {
          setTryOnImage(data.resultImage);
        }
      })
      
      tryOnSocket.on("tryon_error", (error) => {
        console.error("Try-on error:", error);
      });
    } catch (error) {
      console.error("Error with virtual try-on:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (videoStream) {
      interval = setInterval(processFrame, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoStream]);

  const handleAddToWishList = async () => {
    if(!isLoggedIn){
      return alert("Please log in to add items to the wishlist.");
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/wishlist/add",
        { 
          productId: props._id ,
          userId: user.userId
        },
        { withCredentials: true } // Ensure cookies are sent for authentication
      );
      if (response.data.success) {
        dispatch(addToWishlist(props));
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  }

  const handleRemoveFromWishList =async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/wishlist/remove",
        { 
          productId: props._id,
          userId: user.userId
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        dispatch(removeFromWishList(props._id));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }
  return (
    <div className="w-full relative group border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-xl transition duration-300">
      <div className="max-w-80 relative overflow-hidden">
        {/* Product Image */}
        <img className="w-full h-52 rounded-md" src={props.image} alt="Product" />
        {/* Badge */}
        {props.badge && (
          <div className="absolute top-4 left-4">
            <Badge text={props.badge} />
          </div>
        )}
        {/* Hover Buttons */}
        <div className="absolute inset-0 flex flex-col items-end justify-end opacity-0 group-hover:opacity-100 bg-white/90 transition-opacity duration-500 p-3 rounded-lg">
          <button onClick={startCamera} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition duration-300">
            Start Try On <GiReturnArrow />
          </button>
      
          <button onClick={handleAddToCart} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition duration-300">
            Add to Cart <FaShoppingCart />
          </button>
          <button onClick={handleProductDetails} className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition duration-300">
            View Details <MdOutlineLabelImportant />
          </button>
          <button
            onClick={wishlistProducts.some((item) => item._id === props._id) ? handleRemoveFromWishList : handleAddToWishList}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-pink-600 transition duration-300"
          >
            {wishlistProducts.some((item) => item._id === props._id) ? "Remove from Wishlist" : "Add to Wishlist"}
            <BsSuitHeartFill />
          </button>
        </div>
      </div>  

      {/* Product Info */}
      <div className="py-4 text-center">
        <h2 className="text-lg font-bold text-gray-900">{props.title.slice(0, 20)}...</h2>
        <p className="text-sm text-gray-600">${props.price}</p>
      </div>

      {/* Cart Popup */}
      {showPopup && <CartPopup productInfo={productInfo} qty={1} setShowPopup={setShowPopup} />}

      {/* Virtual Try-On Elements */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Virtual Try-On</h2>
            <video ref={videoRef} width="400" height="300" autoPlay playsInline className="rounded-md" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {tryOnImage && <img src={tryOnImage} alt="Try-On Result" className="mt-4 rounded-md w-94 h-auto" />}
            <div className="mt-4 flex justify-between">
              <button
                onClick={stopTryOn}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;

