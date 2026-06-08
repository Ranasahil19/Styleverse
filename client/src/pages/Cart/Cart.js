import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ShippingAddress from "../ShippingAddress/ShippingAddress";
import { AuthContext } from "../../context/AuthContext";
import { PopupMsg } from "../../components/popup/PopupMsg";
import CartList from "./CartList";
import CartSummary from "./CartSummary";
import CouponSection from "./CouponSection";
import useCart from "./useCart";
import emptyCart from "../../assets/images/emptyCart.png";
import CartSkeleton from "../../skeletons/cartSkeletonCard"; // Placeholder for the skeleton loader

const Cart = () => {
  const { state } = useContext(AuthContext);
  const { user } = state || {};
  const userId = user?.userId;

  const {
    cartItems,
    isLoading,
    popup,
    proceedToCheckout,
    totalAmt,
    discountAmt,
    selectedCoupon,
    coupons,
    clearCart,
    handleDelete,
    handleQuantityChange,
    handleCouponChange,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleProceedToCheckout,
    handleBackToCart,
    shippingCharge,
  } = useCart(userId);

  if (proceedToCheckout) {
    return (
      <ShippingAddress
        cartItems={cartItems}
        totalPrice={totalAmt}
        discount={discountAmt}
        clearCart={clearCart}
        shippingCharge={shippingCharge}
        onBack={handleBackToCart}
      />
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 pb-16">
      <Breadcrumbs title="Cart" />
      {isLoading ? (
        <div className="mt-10">
          {[...Array(3)].map((_, index) => (
            <CartSkeleton key={index} />
          ))}
        </div>
      ) : cartItems.length > 0 ? (
        <>
          {popup.show && <PopupMsg message={popup.message} type={popup.type} />}

          <div className="mb-8 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
                  Checkout
                </p>
                <h1 className="mt-1 text-3xl font-bold text-gray-950">
                  Shopping Cart
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review your items, apply a coupon, then continue to delivery.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                <span className="rounded-full bg-primeColor px-3 py-1 text-white">
                  Cart
                </span>
                <span className="h-px w-8 bg-gray-300" />
                <span>Address</span>
                <span className="h-px w-8 bg-gray-300" />
                <span>Payment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <CartList
                cartItems={cartItems}
                handleDelete={handleDelete}
                handleQuantityChange={handleQuantityChange}
              />

              <button
                onClick={clearCart}
                className="rounded-md border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Reset cart
              </button>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <CouponSection
                coupons={coupons}
                selectedCoupon={selectedCoupon}
                handleCouponChange={handleCouponChange}
                handleApplyCoupon={handleApplyCoupon}
                handleRemoveCoupon={handleRemoveCoupon}
              />

              <CartSummary
                totalAmt={totalAmt}
                discountAmt={discountAmt}
                handleProceedToCheckout={handleProceedToCheckout}
                shippingCharge={shippingCharge}
              />
            </aside>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col mdl:flex-row justify-center items-center gap-4 pb-20"
        >
          <div>
            <img
              className="w-80 rounded-lg p-4 mx-auto"
              src={emptyCart}
              alt="emptyCart"
            />
          </div>
          <div className="max-w-[500px] p-4 py-8 bg-white flex gap-4 flex-col items-center rounded-md shadow-lg">
            <h1 className="font-titleFont text-xl font-bold uppercase">
              Your Cart feels lonely.
            </h1>
            <p className="text-sm text-center px-10 -mt-2">
              Your Shopping cart lives to serve. Give it purpose - fill it with
              books, electronics, videos, etc. and make it happy.
            </p>
            <Link to="/shop">
              <button className="bg-primeColor rounded-md cursor-pointer hover:bg-black active:bg-gray-900 px-8 py-2 font-titleFont font-semibold text-lg text-gray-200 hover:text-white duration-300">
                Continue Shopping
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;
