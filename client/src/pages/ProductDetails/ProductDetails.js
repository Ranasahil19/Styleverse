import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductInfo from "../../components/pageProps/productDetails/ProductInfo";
import ProductsOnSale from "../../components/pageProps/productDetails/ProductsOnSale";
import { API_BASE_URL } from "../../config/ApiConfig";

const ProductDetails = () => {
  const { id } = useParams();
  const [productInfo, setProductInfo] = useState({});
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        console.log("Fetched Product:", response.data);
        setProductInfo(response.data);

        // Check if front image exists, otherwise fallback to product.image
        const frontImage = response.data.images?.find((image) => image.type === "front")?.url;
        setMainImage(frontImage || response.data.image); // Use front image if available, else fallback to product.image
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  return (
    <div className="w-full mx-auto border-b border-gray-200 pb-16">
      <div className="max-w-container mx-auto px-4">
        <div>
          <Breadcrumbs title="Product Description" prevLocation="/" />
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 h-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-full rounded-lg bg-gray-50 p-4">
            <ProductsOnSale productInfo={productInfo}/>
          </div>
          <div className="h-full xl:col-span-2 flex justify-center items-center rounded-lg bg-gray-50 p-5">
            {/* Display Main Product Image with Hover Zoom Effect */}
            {mainImage && (
              <div className="relative group w-full max-w-md mx-auto">
                <img
                  className="w-full max-h-96 object-contain rounded-lg transition-transform duration-500 ease-in-out transform group-hover:scale-105"
                  src={mainImage}
                  alt="Product Main"
                />
              </div>
            )}
          </div>
          <div className="h-full w-full md:col-span-2 xl:col-span-3 flex flex-col gap-6 justify-center">
            {/* Product Description */}
            <ProductInfo productInfo={productInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
