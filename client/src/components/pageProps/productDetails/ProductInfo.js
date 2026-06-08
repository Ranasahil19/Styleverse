import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";
import axios from "axios";
import { CartPopup } from "../../popup/PopupMsg";
import { AuthContext } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../config/ApiConfig";
import SkeletonProductInfoCard from "../../../skeletons/productInfoSkeletonCard";

const ProductInfo = ({ productInfo }) => {
  const { state } = useContext(AuthContext);
  const { user } = state;
  const [showPopup, setShowPopup] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cart`, {
        productId: productInfo._id,
        quantity: 1,
        userId: user.userId,
      });

      if (response.data.success) {
        dispatch(
          addToCart({
            _id: productInfo._id,
            name: productInfo.title,
            quantity: 1,
            image: productInfo.image,
            badge: productInfo.badge,
            price: productInfo.price,
          })
        );
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Show skeleton while loading
  if (!productInfo || Object.keys(productInfo).length === 0) {
    return <SkeletonProductInfoCard />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Product Title */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-600">
        {productInfo?.category || "Product"}
      </p>
      <h2 className="text-3xl font-bold text-gray-950">{productInfo?.title || "No Title"}</h2>

      {/* Price */}
      <p className="text-3xl font-bold text-primeColor mt-3">${productInfo?.price || 0}</p>

      {/* Quantity */}
      <p className="text-sm font-medium text-gray-600 mt-3">
        <span className="font-semibold">Available Quantity:</span> {productInfo?.quantity ?? "Not Available"}
      </p>

      {/* Description */}
      <p className="text-gray-600 mt-5 leading-7">
        {productInfo?.description || "No Description Available"}
      </p>

      {/* Categories */}
      <p className="text-sm text-gray-500 mt-4">
        <span className="font-semibold">Category:</span> {productInfo?.category || "N/A"}
      </p>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="w-full mt-6 py-3 bg-primeColor text-white font-bold text-sm uppercase tracking-wide rounded-md hover:bg-black transition-all duration-300"
      >
        Add to Cart
      </button>

      {/* Popup Message */}
      {showPopup && <CartPopup productInfo={productInfo} qty={1} setShowPopup={setShowPopup} />}
    </div>
  );
};

export default ProductInfo;
