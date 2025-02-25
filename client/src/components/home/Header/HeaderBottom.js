import React, { useState, useRef, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaUser,
  FaCaretDown,
  FaShoppingCart,
  FaSignOutAlt,
  FaBox,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import Flex from "../../designLayouts/Flex";
import { Link, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
import axios from "axios"; // Import axios for API calls
import { AuthContext } from "../../../context/AuthContext";

const HeaderBottom = () => {
  // const products = useSelector((state) => state.orebiReducer.products);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AuthContext);
  const { isLoggedIn, user } = state;
  const [cartCount, setCartCount] = useState(0);
  const userId = user?.userId;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // State to store all products from API
  const [showSearchBar, setShowSearchBar] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the dropdown and avatar, close the dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // localStorage.removeItem("user");
    dispatch({
      type: "LOGOUT",
    });
    navigate("/signin");
  };

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products"); // Replace with your API endpoint
        setAllProducts(response.data); // Set the fetched products
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/cart/count/${userId}`
      );
      setCartCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userId) {
        fetchCartCount();
      }
    }, 1000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [userId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on the search query
  useEffect(() => {
    const filtered = allProducts.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, allProducts]);

  return (
    <div className="w-full bg-[#F5F5F3] relative">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
          {/* <div
            onClick={toggleDropdown}
            ref={dropdownRef}
            className="flex h-14 cursor-pointer items-center gap-2 text-primeColor"
          >
            <HiOutlineMenuAlt4 className="w-5 h-5" />
            <p className="text-[14px] font-normal">Shop by Category</p>
          </div> */}
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-primeColor bg-white flex items-center gap-2 justify-between px-6 rounded-xl">
            <input
              className="flex-1 h-full outline-none placeholder:text-[#C4C4C4] placeholder:text-[14px]"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search your products here"
            />
            <FaSearch className="w-5 h-5" />
            {searchQuery && (
              <div
                className={`w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-2xl scrollbar-hide cursor-pointer`}
              >
                {filteredProducts.map((item) => (
                  <div
                    onClick={() =>
                      navigate(
                        `/products/${item._id
                          .toLowerCase()
                          .split(" ")
                          .join("")}`,
                        {
                          state: {
                            item: item,
                          },
                        }
                      ) & setSearchQuery("")
                    }
                    key={item._id}
                    className="max-w-[600px] h-28 bg-gray-100 mb-3 flex items-center gap-3"
                  >
                    <img className="w-24" src={item.image} alt="productImg" />
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-lg">{item.title}</p>
                      <p className="text-xs">{item.description}</p>
                      <p className="text-sm">
                        Price:{" "}
                        <span className="text-primeColor font-semibold">
                          ${item.price}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 lg:mt-0 items-center pr-6 cursor-pointer relative">
            {/* <div onClick={() => setShowUser(!showUser)} className="flex">
              <FaUser />
              <FaCaretDown />
            </div> */}
            <div className="relative">
              {/* Avatar Button */}
              <div
                ref={avatarRef}
                className="flex items-center cursor-pointer space-x-2"
                onClick={toggleDropdown}
              >
                <div
                  className={`${
                    isLoggedIn
                      ? "bg-black text-white"
                      : "bg-gray-400 text-gray-800"
                  } rounded-full w-10 h-10 flex items-center justify-center text-lg uppercase`}
                >
                  {/* Display the first character of the username or "G" */}
                  {isLoggedIn && user?.username ? user.username.charAt(0) : "G"}
                </div>
              </div>
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                ref={dropdownRef}
                className="absolute mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 
                  w-56 sm:w-48 lg:w-56 lg:right-5 left-1/2 transform -translate-x-1/2 sm:left-auto sm:translate-x-0 
                  overflow-hidden"
                >
                  <div className="px-4 py-4">
                    <h3 className="font-bold text-base text-gray-800 border-b pb-2">
                      Your Account
                    </h3>
                    {user ? (
                      <motion.ul
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 pt-4"
                      >
                        <li className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer transition-all duration-300">
                          <FaUser className="mr-3 text-lg text-blue-500" />
                          <Link
                            to="/profile/myaccount"
                            className="text-sm font-medium"
                          >
                            Your Account
                          </Link>
                        </li>
                        <li className="flex items-center text-gray-600 hover:text-green-600 cursor-pointer transition-all duration-300">
                          <FaBox className="mr-3 text-lg text-green-500" />
                          <Link
                            to="/profile/myorders"
                            className="text-sm font-medium"
                          >
                            Your Orders
                          </Link>
                        </li>
                        <li className="flex items-center text-gray-600 hover:text-red-600 cursor-pointer transition-all duration-300">
                          <FaSignOutAlt className="mr-3 text-lg text-red-500" />
                          <button
                            onClick={handleLogout}
                            className="text-sm font-medium focus:outline-none"
                          >
                            Sign Out
                          </button>
                        </li>
                      </motion.ul>
                    ) : (
                      <motion.ul
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 pt-4"
                      >
                        <li className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer transition-all duration-300">
                          <FaSignInAlt className="mr-3 text-lg text-blue-500" />
                          <Link to="/signin" className="text-sm font-medium">
                            Sign In
                          </Link>
                        </li>
                        <li className="flex items-center text-gray-600 hover:text-green-600 cursor-pointer transition-all duration-300">
                          <FaUserPlus className="mr-3 text-lg text-green-500" />
                          <Link to="/signup" className="text-sm font-medium">
                            Sign Up
                          </Link>
                        </li>
                      </motion.ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart">
              <div className="relative">
                <FaShoppingCart />
                <span className="absolute font-titleFont top-3 -right-2 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-primeColor text-white">
                  {cartCount}
                </span>
              </div>
            </Link>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;
