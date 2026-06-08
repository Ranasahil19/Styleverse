import React, { useContext, useEffect, useState } from "react";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setWishlist } from "../../redux/orebiSlice";
import { PopupMsg } from "../../components/popup/PopupMsg";
import { API_BASE_URL } from "../../config/ApiConfig";

function WishList() {
  const { state } = useContext(AuthContext);
  const { user } = state;
  const dispatch = useDispatch();

  const wishlistProducts = useSelector(
    (state) => state.orebiReducer?.wishlistProducts
  );
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });

  useEffect(() => {
    if (!user?.userId) return; // Ensure user exists before fetching

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/wishlist/${user.userId}`)
      .then((response) => {
        dispatch(setWishlist(response.data.wishlist)); // Store products in Redux
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wishlist:", error);
        setLoading(false);
      });
  }, [user]); // Re-run only when `user` changes

  // ✅ Remove Product from Wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/wishlist/remove`,
        {
          userId: user?.userId, // Ensure `userId` is available
          productId,
        }
      );

      if (response.data.success) {
        const updatedWishlist = wishlistProducts.filter(
          (p) => p._id !== productId
        );
        dispatch(setWishlist(updatedWishlist)); // Update Redux store
        setPopup({
          message: "Product removed from wishlist",
          type: "success",
          show: true,
        });
      }
    } catch (error) {
      console.error(
        "Error removing from wishlist:",
        error.response?.data || error.message
      );
      setPopup({
        message: "Error removing from wishlist",
        type: "error",
        show: true,
      });
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <Breadcrumbs title="Wish List Product" />
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
          Saved Items
        </p>
        <h2 className="mt-1 text-3xl font-bold text-gray-950">Your Wishlist</h2>
        <p className="mt-1 text-sm text-gray-500">Keep track of products you love.</p>
      </div>
      {popup.show && <PopupMsg type={popup.type} message={popup.message} />}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">Loading...</div>
      ) : wishlistProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">Your wishlist is empty.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product._id}
              className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Link to={`/products/${product._id}`}>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-52 object-contain rounded-md bg-gray-50 p-3"
                />
                <h3 className="text-base font-bold mt-3 text-gray-950">{`${product.title.slice(
                  0,
                  20
                )}...`}</h3>
                <p className="text-primeColor font-bold mt-1">${product.price}</p>
              </Link>

              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 bg-white border border-red-100 text-red-500 p-2 rounded-full shadow-sm hover:bg-red-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishList;
