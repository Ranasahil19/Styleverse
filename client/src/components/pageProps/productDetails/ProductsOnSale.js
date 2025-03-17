import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ProductsOnSale = ({ productInfo }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const fetchRecommendedProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/product/recommendations`,
        {
          params: {
            // ✅ Send as query parameters
            productId: productInfo._id,
            category: productInfo.category,
          },
        }
      );
      console.log("Product on Sale", response.data);

      if (response.data.success) {
        setRecommendedProducts(response.data.recommendedProducts);
      }
    } catch (error) {
      console.error("Error fetching recommended products:", error);
    }
  };

  useEffect(() => {
    if (productInfo) {
      fetchRecommendedProducts();
    }
  }, [productInfo]);

  return (
    <div className="overflow-hidden">
      <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
        AI Recommended Products
      </h3>
      <div className="flex flex-col gap-2 h-full">
        {recommendedProducts.length > 0 ? (
          recommendedProducts.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 h-32 border-b border-gray-300 py-2"
            >
              {/* Product Image */}
              <div className="w-24 h-24">
                <img
                  className="w-full h-full object-cover rounded-md"
                  src={item.image}
                  alt={item.title}
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between h-full">
                <p className="text-base font-medium">{item.title}</p>
                <p className="text-sm font-semibold text-green-600">
                  ${item.price}
                </p>

                {/* View Details Button */}
                <Link
                  to={`/products/${item._id}`}
                  className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition duration-300 text-center w-fit"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recommendations available.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsOnSale;
