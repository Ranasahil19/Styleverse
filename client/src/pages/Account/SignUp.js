import React, { useState } from "react";
import axios from "axios";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaCheck, FaTimes } from "react-icons/fa";
import { logoLight } from "../../assets/images";
import { PopupMsg } from "../../components/popup/PopupMsg";
import zxcvbn from "zxcvbn";
import { API_BASE_URL } from "../../config/ApiConfig";

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [suggestedPassword , setSuggestedPassword] = useState("")
  const [showPasswordDialog , setShowPasswordDialog] = useState(false);
  const [isPasswordPrompted, setIsPasswordPrompted] = useState(false);

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return zxcvbn(pwd).score >= 3 ? pwd : generateStrongPassword();
  };

  const handlePasswordTyping = (e) => {
    setPassword(e.target.value);

    if (!isPasswordPrompted && e.target.value.length === 1) {
      const strongPwd = generateStrongPassword();
      setSuggestedPassword(strongPwd);
      setShowPasswordDialog(true);
      setIsPasswordPrompted(true); // Ensure prompt appears only once
    }
  };

  const handleConfirmPassword = () => {
    setPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
    navigator.clipboard.writeText(suggestedPassword); // Copy to clipboard
    setShowPasswordDialog(false);
    setPopup({ message: "Password copied to clipboard!", type: "success", show: true });
  };

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
      await axios.post(`${API_BASE_URL}/register`, {
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
    }
  }    

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg flex overflow-hidden w-full max-w-5xl border border-gray-200">
        {/* Left Side */}
        <div className="hidden md:flex flex-col w-1/2 bg-primeColor text-white p-10">
          <Link to="/">
            <img src={logoLight} alt="Logo" className="w-32 mb-4" />
          </Link>
          <h2 className="text-3xl font-bold mb-4">
            Welcome to StyleVerse!
          </h2>
          <p className="text-base mb-6 text-gray-300">
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
        <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-10">
          {popup.show && (
            <PopupMsg message={popup.message} type={popup.type} />
          )}
          <h2 className="text-3xl font-bold text-gray-950 mb-2 text-center">
            Sign Up
          </h2>
          <p className="mb-6 text-center text-sm text-gray-500">Create your StyleVerse customer account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:outline-none focus:border-primeColor"
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
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:outline-none focus:border-primeColor"
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
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:outline-none focus:border-primeColor"
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
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:outline-none focus:border-primeColor"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordTyping}
                required
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:outline-none focus:border-primeColor"
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
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:outline-none focus:border-primeColor"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primeColor text-white rounded-md font-bold hover:bg-black transition"
            >
              Sign Up
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/signin" className="text-primeColor font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
      {showPasswordDialog && (
        <div className="absolute mt-2 bg-white border border-gray-200 shadow-xl rounded-md p-3 w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Try a Strong Password</span>
            <button onClick={() => setShowPasswordDialog(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          <div className="text-sm bg-gray-100 p-2 rounded-md text-gray-800 font-mono select-all">
            {suggestedPassword}
          </div>
          <button onClick={handleConfirmPassword} className="mt-2 w-full bg-primeColor text-white text-sm py-1.5 rounded-md hover:bg-black">
            Use
          </button>
        </div>
      )}
    </div>
  );
};

export default SignUp;
