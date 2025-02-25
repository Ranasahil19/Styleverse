import React, { useState } from "react";
import axios from "axios";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaCheck } from "react-icons/fa";
import { logoLight } from "../../assets/images";
import { PopupMsg } from "../../components/popup/PopupMsg";

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUserExist, setIsUserExist] = useState(true);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPopup({
        message: "Passwords do not match!",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", {
        username,
        password,
        confirmPassword,
        email,
        firstname,
        lastname,
      });
    
      setPopup({
        message: "🎉 Registration successful! We’ve sent a verification email to your inbox. Please check your email to verify your account.",
        type: "success",
        show: true,
      });
    
      setUsername("");
      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    
      setTimeout(() => {
        localStorage.setItem("verificationEmail", email);
        navigate(`/verify-email?email=${email}`);
      }, 100);
    } catch (error) {
      setPopup({
        message: "😕 It seems that the user already exists. Please login to continue!",
        type: "error",
        show: true,
      });
      setIsUserExist(false);
    }
  }    

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg flex overflow-hidden w-full max-w-4xl">
        {/* Left Side */}
        <div className="hidden md:flex flex-col w-1/2 bg-purple-600 text-white p-8">
          <Link to="/">
            <img src={logoLight} alt="Logo" className="w-32 mb-4" />
          </Link>
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to OREBI!
          </h2>
          <p className="text-base mb-6">
            Create your account to explore our services and get started.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="text-green-400" />
              <span>Access premium features and services.</span>
            </li>
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="text-green-400" />
              <span>Enjoy a personalized experience.</span>
            </li>
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="text-green-400" />
              <span>Join a trusted community of users.</span>
            </li>
          </ul>
          <div className="mt-auto flex justify-between text-sm">
            <Link to="#" className="hover:underline">
              Terms
            </Link>
            <Link to="#" className="hover:underline">
              Privacy
            </Link>
            <Link to="#" className="hover:underline">
              Security
            </Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
          {popup.show && (
            <PopupMsg message={popup.message} type={popup.type} />
          )}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <FaCheck className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Sign Up
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/signin" className="text-purple-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;