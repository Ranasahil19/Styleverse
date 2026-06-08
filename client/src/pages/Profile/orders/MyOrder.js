import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import useOrders from "./useOrders";
import OrderFilter from "./OrderFilter";
import OrderCard from "./OrderCard";
import { PopupMsg } from "../../../components/popup/PopupMsg";
import OrderCardSkeleton from "../../../skeletons/orderCardSkeletonCard";
import AccountLayout from "../AccountLayout";
import { FiBox } from "react-icons/fi";

const MyOrder = () => {
  const { state } = useContext(AuthContext);
  const { user } = state;
  const {
    popup,
    filteredOrders,
    filter,
    years,
    handleFilterChange,
    handleSearchTermChange,
    isLoading,
  } = useOrders();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-950">
            No user logged in.
          </h2>
          <p className="mt-2 text-gray-500">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout
      title="My Orders"
      description="Track recent purchases, view details, and download invoices after delivery."
    >
      {popup.show && <PopupMsg message={popup.message} type={popup.type} />}
      <OrderFilter
        orders={filteredOrders}
        filter={filter}
        years={years}
        onSearchChange={handleSearchTermChange}
        onFilterChange={handleFilterChange}
      />
      {isLoading ? (
        <div className="space-y-5">
          {[...Array(3)].map((_, idx) => (
            <OrderCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} user={user} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-500">
            <FiBox size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-950">No orders found</h2>
          <p className="mt-2 text-sm text-gray-500">
            Try changing the filter or search term.
          </p>
        </div>
      )}
    </AccountLayout>
  );
};

export default MyOrder;
