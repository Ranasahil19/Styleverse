import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { PopupMsg } from "../../components/popup/PopupMsg";
import { API_BASE_URL } from "../../config/ApiConfig";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const { id, token } = useParams();
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const validateForm = () => {
    let errors = {};
    if (!password) errors.password = "Password is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/reset-password/${id}/${token}`,
        { password }
      );
      if (res.status === 200) {
        setSuccessMsg(res.data.message);
        setPopup({
          message: "Password Reset Successfully",
          type: "success",
          show: true,
        });
        if (localStorage.getItem("closeTabAfterReset") === "true") {
          localStorage.removeItem("closeTabAfterReset");
          window.close(); // Attempts to close the original tab
        }        
      }
    } catch (e) {
      setPopup({
        message: "Failed to reset password. Please try again.",
        type: "error",
        show: true,
      });
      setErrors(e.response?.data?.errors || {});
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
          Reset Password
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your new password to reset your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-md border border-gray-200 px-4 focus:outline-none focus:border-primeColor"
              placeholder="Enter Your Password"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-2">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-primeColor text-white font-bold hover:bg-black focus:outline-none"
          >
            Reset Password
          </button>
        </form>
        {successMsg && (
          <p className="text-green-500 text-center mt-4">{successMsg}</p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
