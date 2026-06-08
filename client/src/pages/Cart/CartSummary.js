import React from "react";

const CartSummary = ({ totalAmt, discountAmt, handleProceedToCheckout, shippingCharge }) => {
  const subtotal = totalAmt + discountAmt;
  const total = totalAmt + shippingCharge;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-950">Order Summary</h3>
      <p className="mt-1 text-sm text-gray-500">Taxes and shipping are finalized at checkout.</p>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span className="font-semibold">- ${discountAmt.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-orange-500">
          <span>Shipping Charge</span>
          <span className="font-semibold">+ ${shippingCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-950">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleProceedToCheckout}
        className="mt-6 w-full rounded-md bg-primeColor py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;
