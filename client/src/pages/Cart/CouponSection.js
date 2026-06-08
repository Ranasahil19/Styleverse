import React from "react";

const CouponSection = ({
  coupons,
  selectedCoupon,
  handleCouponChange,
  handleApplyCoupon,
  handleRemoveCoupon,
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-bold text-gray-950">Promo Code</h3>
    <p className="mt-1 text-sm text-gray-500">Apply an available coupon before checkout.</p>
    <select
      className="mt-4 h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-primeColor outline-none transition focus:border-primeColor"
      onChange={handleCouponChange}
      defaultValue=""
    >
      <option value="">Select a Coupon</option>
      {coupons.map((coupon, index) => (
        <option key={index} value={coupon.code}>
          {coupon.code} ({coupon.type === "flat" ? `$${coupon.discount}` : `${coupon.discount}%`})
          (Min: ${coupon.minPurchase})
        </option>
      ))}
    </select>

    {selectedCoupon && (
      <div className="mt-4 rounded-lg border border-dashed border-violet-300 bg-violet-50 p-4 text-gray-700">
        <h3 className="rounded-md bg-white px-4 py-2 text-center text-base font-bold text-primeColor shadow-sm">
          {selectedCoupon.code}
        </h3>
        <p className="mt-3 text-sm">
          <strong>Discount:</strong>{" "}
          {selectedCoupon.type === "flat" ? `$${selectedCoupon.discount}` : `${selectedCoupon.discount}%`}
        </p>
        <p className="text-sm">
          <strong>Min Purchase:</strong> ${selectedCoupon.minPurchase}
        </p>
        <p className="text-sm">
          <strong>Max Discounts:</strong> ${selectedCoupon.maxDiscount}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={handleApplyCoupon} className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
            Apply
          </button>
          <button onClick={handleRemoveCoupon} className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
            Remove
          </button>
        </div>
      </div>
    )}
  </div>
);

export default CouponSection;
