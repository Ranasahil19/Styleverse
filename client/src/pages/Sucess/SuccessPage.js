import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PopupMsg } from "../../components/popup/PopupMsg";
import { FaCheckCircle } from "react-icons/fa";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { API_BASE_URL } from "../../config/ApiConfig";

const SuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const { state } = useContext(AuthContext);
  const { user } = state;
  const userId = user?.userId;
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "", show: false });
  const shippingCharge = 5;

  useEffect(() => {
    const finalizePaymentAndFetchOrder = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (sessionId) {
          await axios.post(`${API_BASE_URL}/api/finalize-payment`, {
            sessionId,
          });

          window.dispatchEvent(
            new CustomEvent("cartCountUpdated", {
              detail: { userId, count: 0 },
            })
          );
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/order/${userId}`
        );
        setOrderDetails(response.data);

        if (!localStorage.getItem("popupShown")) {
          setPopup({
            message: `Payment successful! Order Status: ${
              response.data.status
            }, Estimated Delivery: ${new Date(
              response.data.deliveryDate
            ).toDateString()}`,
            type: "success",
            show: true,
          });
          localStorage.setItem("popupShown", "true");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setIsLoading(false);
      }
    };

    if (userId) {
      finalizePaymentAndFetchOrder();
    }
  }, [searchParams, userId]);

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(
        () => setPopup((currentPopup) => ({ ...currentPopup, show: false })),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  if (isLoading) {
    return (
      <div className="max-w-container mx-auto flex min-h-[60vh] items-center justify-center px-4 text-xl font-semibold text-gray-800">
        Loading order details...
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="max-w-container mx-auto flex min-h-[60vh] items-center justify-center px-4 text-xl font-semibold text-gray-800">
        No order details found.
      </div>
    );
  }

  // Calculate the original total (before discount)
  const originalTotal = orderDetails.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const totalAmount = originalTotal + 5;

  const discountApplied = totalAmount > orderDetails.totalPrice;
  const discountAmount = discountApplied
    ? totalAmount - orderDetails.totalPrice
    : 0;

  return (
    <div className="max-w-container mx-auto px-4 pb-16 pt-8">
      <Breadcrumbs title="Order Success" />
      {popup.show && <PopupMsg message={popup.message} type={popup.type} />}

      <div className="mb-8 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-600">
              <FaCheckCircle className="text-2xl" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
                Payment Complete
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-950">
                Order placed successfully
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Expected delivery by{" "}
                {new Date(orderDetails.deliveryDate).toLocaleDateString()}.
              </p>
            </div>
          </div>
          <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span className="block font-semibold text-gray-950">
              Order ID
            </span>
            <span className="break-all">{orderDetails.orderId || orderDetails._id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-950">Ordered Items</h2>
            <p className="text-sm text-gray-500">
              {orderDetails.items.length} items in this order
            </p>
          </div>

          <div className="space-y-4">
            {orderDetails.items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-20 w-20 rounded-md border border-gray-100 bg-gray-50 object-contain p-2"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-gray-950">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Qty {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="text-base font-bold text-gray-950">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Order Summary</h2>
            <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 text-sm">
              <SummaryLine label="Subtotal" value={`$${originalTotal.toFixed(2)}`} />
              <SummaryLine
                label="Shipping"
                value={`+ $${shippingCharge.toFixed(2)}`}
                accent="orange"
              />
              {discountApplied && (
                <SummaryLine
                  label="Discount"
                  value={`- $${discountAmount.toFixed(2)}`}
                  accent="green"
                />
              )}
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-950">
                <span>Total Paid</span>
                <span>${orderDetails.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Delivery</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              {orderDetails.shippingAddress.address},<br />
              {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
              <br />
              {orderDetails.shippingAddress.pincode}, {orderDetails.shippingAddress.country}
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              Phone: {orderDetails.shippingAddress.mobileno}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/profile/myorders")}
              className="rounded-md bg-primeColor px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="rounded-md border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const SummaryLine = ({ label, value, accent }) => {
  const color =
    accent === "green"
      ? "text-green-600"
      : accent === "orange"
      ? "text-orange-500"
      : "text-gray-600";

  return (
    <div className={`flex justify-between ${color}`}>
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

export default SuccessPage;
