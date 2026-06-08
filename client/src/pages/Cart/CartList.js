import React from "react";
import ItemCard from "./ItemCard";

const CartList = ({ cartItems, handleDelete, handleQuantityChange }) => (
  <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="hidden border-b border-gray-200 bg-gray-50 px-5 py-4 text-sm font-semibold uppercase tracking-wide text-gray-500 lgl:grid lgl:grid-cols-[minmax(0,1.8fr)_110px_150px_110px_40px]">
      <h2>Product</h2>
      <h2>Price</h2>
      <h2>Quantity</h2>
      <h2>Subtotal</h2>
      <span />
    </div>
    <div className="divide-y divide-gray-100">
      {cartItems.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          handleDelete={handleDelete}
          handleQuantityChange={handleQuantityChange}
        />
      ))}
    </div>
  </div>
);

export default CartList;
