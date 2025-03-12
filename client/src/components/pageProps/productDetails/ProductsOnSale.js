import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductsOnSale = ({ productInfo }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  
  const fetchRecommendedProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/product/recommendations`,
        {
          params: { // ✅ Send as query parameters
            productId: productInfo._id,
            category: productInfo.category
          }
        }
      );
      console.log("Product on Sale", response.data)
      
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
              className="flex items-center gap-4 h-28 border-b-[1px] border-b-gray-300 py-2"
            >
              <div>
                <img className="w-24" src={item.image} alt={item.title} />
              </div>
              <div className="flex flex-col gap-2 font-titleFont">
                <p className="text-base font-medium">{item.title}</p>
                <p className="text-sm font-semibold">${item.price}</p>
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