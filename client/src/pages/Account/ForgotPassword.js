import React, { useState } from "react";
import axios from "axios";
import { PopupMsg } from "../../components/popup/PopupMsg";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/ApiConfig";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const validateForm = () => {
    let errors = {};
    if (!email) errors.email = "Email is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email,
      });
      if (res.status === 200) {
        setSuccessMsg(res.data.message);
        localStorage.setItem("closeTabAfterReset", "true");
        setPopup({
          message: "Reset Password Link Sent to your Email",
          type: "success",
          show: true,
        });
      }
    } catch (e) {
      console.error("Error", e);
      setPopup({
        message: "Failed to send reset password link. Please try again.",
        type: "error",
        show: true,
      });
    }
  };

  // useEffect(() => {
  //   if (popup.show) {
  //     const timer = setTimeout(() => setPopup({ ...popup, show: false }), 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [popup]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {popup.show && <PopupMsg message={popup.message} type={popup.type} />}
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-950 mb-3">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address below to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-md border border-gray-200 px-4 focus:outline-none focus:border-primeColor"
              placeholder="Enter Your Email"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2">{errors.email}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-primeColor text-white font-bold hover:bg-black focus:outline-none"
          >
            Send Reset Link
          </button>
        </form>
        {successMsg && (
          <p className="text-green-500 text-center mt-4">{successMsg}</p>
        )}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Remembered your password?{" "}
            <Link
              to="/signin"
              className="text-primeColor font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
