import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config/ApiConfig";
import SkeletonCard from "../../../skeletons/productSkeletonCard";
import Heading from "./Heading";
import Product from "./Product";

const dedupeProducts = (products) => {
  const seen = new Set();

  return products.filter((product) => {
    const key = [
      product._id || product.id,
      product.title?.trim().toLowerCase(),
      product.image,
      product.price,
    ]
      .filter(Boolean)
      .join("|");

    const fallbackKey = [
      product.title?.trim().toLowerCase(),
      product.image,
      product.price,
    ]
      .filter(Boolean)
      .join("|");

    const dedupeKey = fallbackKey || key;

    if (seen.has(dedupeKey)) {
      return false;
    }

    seen.add(dedupeKey);
    return true;
  });
};

const ProductSection = ({ category, heading }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${category}`);
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(`Error fetching ${heading} products`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, heading]);

  const visibleProducts = useMemo(() => dedupeProducts(products), [products]);

  return (
    <section className="w-full pb-20">
      <div className="mb-7 flex items-end justify-between gap-4">
        <Heading heading={heading} />
        {!loading && visibleProducts.length > 0 && (
          <span className="hidden text-sm font-medium text-gray-500 sm:block">
            {visibleProducts.length} products
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, index) => <SkeletonCard key={index} />)
          : visibleProducts.map((product) => (
              <Product
                key={product._id || product.id}
                _id={product._id}
                image={product.image}
                title={product.title}
                price={product.price}
                badge={product.badge}
                des={product.description}
                category={product.category}
              />
            ))}
      </div>

      {!loading && visibleProducts.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm font-medium text-gray-500">
          No products available yet.
        </div>
      )}
    </section>
  );
};

export default ProductSection;
