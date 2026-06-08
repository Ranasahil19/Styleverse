import React from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const ItemCard = ({ item, handleDelete, handleQuantityChange }) => {
  const handleDecrement = () => {
    if (item.quantity >= 1) {
      handleQuantityChange(item.productId, "decrement");
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(item.productId, "increment");
  };

  return (
    <div className="grid w-full grid-cols-1 gap-4 px-4 py-5 lgl:grid-cols-[minmax(0,1.8fr)_110px_150px_110px_40px] lgl:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <img
          className="h-24 w-24 rounded-lg border border-gray-100 bg-gray-50 object-contain p-2"
          src={item.image}
          alt={item.title}
        />
        <div className="min-w-0">
          <h1 className="truncate font-titleFont text-base font-semibold text-gray-950">
            {item.title}
          </h1>
          <p className="mt-1 text-sm capitalize text-gray-500">
            {item.category}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm lgl:block">
        <span className="font-semibold text-gray-500 lgl:hidden">Price</span>
        <span className="font-semibold text-gray-900">${item.price}</span>
      </div>

      <div className="flex items-center justify-between lgl:block">
        <span className="text-sm font-semibold text-gray-500 lgl:hidden">
          Quantity
        </span>
        <div className="inline-flex h-10 items-center rounded-md border border-gray-200 bg-white">
          <button
            type="button"
            onClick={handleDecrement}
            className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Decrease quantity"
          >
            <FiMinus />
          </button>
          <span className="min-w-[40px] text-center text-sm font-bold text-gray-950">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Increase quantity"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm lgl:block">
        <span className="font-semibold text-gray-500 lgl:hidden">Subtotal</span>
        <span className="font-titleFont font-bold text-gray-950">
          ${(item.quantity * item.price).toFixed(2)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => handleDelete(item._id)}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-100 text-sm font-semibold text-red-500 transition hover:bg-red-50 lgl:w-10"
        aria-label="Remove item"
      >
        <FiTrash2 />
        <span className="lgl:hidden">Remove</span>
      </button>
      </div>
  );
};

export default ItemCard;
