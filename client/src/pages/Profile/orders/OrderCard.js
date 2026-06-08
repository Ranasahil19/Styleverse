import React from "react";
import { Link } from "react-router-dom";
import InvoiceDropdown from "./InvoiceDropdown";
import { FiChevronRight, FiPackage } from "react-icons/fi";

const OrderCard = ({ order, user }) => {
  const statusClass =
    order.status === "Pending"
      ? "bg-yellow-50 text-yellow-700"
      : order.status === "Shipped"
      ? "bg-blue-50 text-blue-700"
      : order.status === "Delivered"
      ? "bg-green-50 text-green-700"
      : order.status === "Cancelled"
      ? "bg-red-50 text-red-700"
      : order.status === "Processing"
      ? "bg-orange-50 text-orange-700"
      : "bg-gray-50 text-gray-700";

  return (
    <div
      key={order._id}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-gray-700 shadow-sm">
                <FiPackage />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-lg font-bold text-gray-950">
                  ${order.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              <span>Placed {new Date(order.createdAt).toLocaleDateString()}</span>
              <span>Ship to {user.username}</span>
              <span>{order.items.length} items</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${statusClass}`}>
              {order.status}
            </span>
            <div className="flex items-center gap-3">
              <Link
                to={`/orders-details/${order._id}`}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                View Details <FiChevronRight />
              </Link>
              {order.status === "Delivered" ? (
                <InvoiceDropdown orderId={order._id} />
              ) : (
                <span className="text-xs font-semibold text-gray-400">
                  Invoice after delivery
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 px-5 py-2">
        {order.items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 py-4"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-16 w-16 rounded-md border border-gray-100 bg-gray-50 object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-base font-bold text-gray-950">{item.title}</h4>
              <p className="text-sm text-gray-500">
                ${item.price} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-gray-950">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
