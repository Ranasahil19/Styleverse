import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { AuthContext } from "../../context/AuthContext";
import { PopupMsg } from "../../components/popup/PopupMsg";
import { stripeKey } from "../../config/ApiConfig";
import { API_BASE_URL } from "../../config/ApiConfig";
import { FiArrowLeft, FiCreditCard, FiMapPin, FiTruck } from "react-icons/fi";

const stripePromise = loadStripe(stripeKey);

const ShippingAddress = ({
  cartItems = [],
  totalPrice = 0,
  discount = 0,
  shippingCharge = 5,
  onBack,
}) => {
  const { state } = useContext(AuthContext);
  const { user } = state || {};
  const userId = user?.userId;

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    mobileno: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });

  useEffect(() => {
    const fetchShippingAddress = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/user/${userId}`
        );
        if (response.data?.address) {
          setShippingAddress(response.data.address);
          setIsUpdating(true);
        }
      } catch (error) {
        console.error("Error fetching shipping address:", error);
      }
    };

    if (userId) fetchShippingAddress();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!userId) {
      showPopup("User ID is missing.", "error");
      return;
    }

    if (!isAddressComplete) {
      showPopup("Please complete all address fields.", "error");
      return;
    }

    try {
      setIsSaving(true);
      const apiUrl = isUpdating
        ? `${API_BASE_URL}/api/user/update-address/${userId}`
        : `${API_BASE_URL}/api/user/add-address/${userId}`;
      const method = isUpdating ? "PUT" : "POST";

      await axios({
        url: apiUrl,
        method: method,
        headers: { "Content-Type": "application/json" },
        data: { address: shippingAddress },
      });

      setPopup({
        message: isUpdating
          ? "Shipping address updated successfully!"
          : "Shipping address added successfully!",
        type: "success",
        show: true,
      });
      setIsUpdating(true);
    } catch (error) {
      console.error("Error saving address:", error);
      setPopup({
        message: "Failed to save shipping address. Please try again.",
        type: "error",
        show: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const finalPrice = Number(totalPrice) + Number(shippingCharge);
  const isAddressComplete = [
    "address",
    "city",
    "state",
    "country",
    "pincode",
    "mobileno",
  ].every((field) => shippingAddress[field]?.trim());

  const handleCheckout = async () => {
    if (!isAddressComplete) {
      showPopup("Please save a complete shipping address before payment.", "error");
      return;
    }

    try {
      setIsPaying(true);
      const stripe = await stripePromise;

      // Create payment session
      const stripeResponse = await axios.post(
        `${API_BASE_URL}/api/create-payment`,
        {
          userId,
          products: cartItems,
          paymentMethod: "Visa",
          discount,
          totalPrice: finalPrice,
          shippingAddress,
        }
      );

      const { sessionId } = stripeResponse.data;
      
      // Finalize payment
      await axios.post(`${API_BASE_URL}/api/finalize-payment`, {
        sessionId: sessionId,
      });

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("Error during payment or order placement:", error);
      showPopup("An error occurred. Please try again.", "error");
    } finally {
      setIsPaying(false);
    }
  };

  const showPopup = (message, type = "info") => {
    setPopup({ message, type, show: true });
  };

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ ...popup, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  return (
    <div className="max-w-container mx-auto px-4 pb-16 pt-8">
      {popup.show && <PopupMsg message={popup.message} type={popup.type} />}

      <div className="mb-8 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
              Checkout
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">
              Delivery Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Confirm where your order should be delivered.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <span>Cart</span>
            <span className="h-px w-8 bg-gray-300" />
            <span className="rounded-full bg-primeColor px-3 py-1 text-white">
              Address
            </span>
            <span className="h-px w-8 bg-gray-300" />
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form
          onSubmit={handleSaveAddress}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-50 text-violet-600">
              <FiMapPin />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-950">
                Shipping Address
              </h2>
              <p className="text-sm text-gray-500">
                {isUpdating ? "Update your saved address." : "Add a delivery address."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <AddressInput
                label="Address"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="House no, building, street"
              />
            </div>
            <AddressInput
              label="City"
              name="city"
              value={shippingAddress.city}
              onChange={handleInputChange}
              placeholder="City"
            />
            <AddressInput
              label="State"
              name="state"
              value={shippingAddress.state}
              onChange={handleInputChange}
              placeholder="State"
            />
            <AddressInput
              label="Country"
              name="country"
              value={shippingAddress.country}
              onChange={handleInputChange}
              placeholder="Country"
            />
            <AddressInput
              label="Pincode"
              name="pincode"
              value={shippingAddress.pincode}
              onChange={handleInputChange}
              placeholder="Postal code"
            />
            <div className="md:col-span-2">
              <AddressInput
                label="Mobile Number"
                name="mobileno"
                value={shippingAddress.mobileno}
                onChange={handleInputChange}
                placeholder="Delivery contact number"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FiArrowLeft /> Back to cart
            </button>
            <button
              type="submit"
              className="rounded-md bg-primeColor px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isUpdating ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50 text-green-600">
                <FiTruck />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-950">Order Review</h2>
                <p className="text-sm text-gray-500">{cartItems.length} items</p>
              </div>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-16 w-16 rounded-md border border-gray-100 bg-gray-50 object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-950">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 text-sm">
              <SummaryLine label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <SummaryLine label="Discount" value={`- $${Number(discount).toFixed(2)}`} accent="green" />
              <SummaryLine label="Shipping" value={`+ $${Number(shippingCharge).toFixed(2)}`} accent="orange" />
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-950">
                <span>Total</span>
                <span>${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isPaying}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiCreditCard />
              {isPaying ? "Redirecting..." : "Pay Securely"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const AddressInput = ({ label, name, value, onChange, placeholder }) => (
  <label className="block">
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-2 h-12 w-full rounded-md border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primeColor focus:ring-2 focus:ring-gray-100"
      required
    />
  </label>
);

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

export default ShippingAddress;
