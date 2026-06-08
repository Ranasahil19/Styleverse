import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { motion } from "framer-motion";
import Image from "../../designLayouts/Image";
import { navBarList } from "../../../constants";
import Flex from "../../designLayouts/Flex";
import Logo from "../../../assets/images/LOGO.png";
import axios from "axios";
// import { logo } from "../../../assets/images";
import { API_BASE_URL } from "../../../config/ApiConfig";

const Header = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [sidenav, setSidenav] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [category, setCategory] = useState([]);
  const [badges, setBadges] = useState([]);
  const location = useLocation();
  useEffect(() => {
    let ResponsiveMenu = () => {
      if (window.innerWidth < 667) {
        setShowMenu(false);
      } else {
        setShowMenu(true);
      }
    };
    ResponsiveMenu();
    window.addEventListener("resize", ResponsiveMenu);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/filters`);
        setCategory(response.data.categories);
        console.log(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/badge`);
        setBadges(response.data);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="w-full h-20 bg-white/95 backdrop-blur sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <nav className="h-full px-4 max-w-container mx-auto relative">
        <Flex className="flex items-center justify-between h-full">
          <Link to="/">
            <div className="flex items-center">
              <Image className="w-40 md:w-48 object-contain" imgSrc={Logo} />
            </div>
          </Link>
          <div>
            {showMenu && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center w-auto z-50 p-0 gap-2 rounded-full bg-gray-50 px-2 py-2"
              >
                <>
                  {navBarList.map(({ _id, title, link }) => (
                    <NavLink
                      key={_id}
                      className="flex h-9 items-center justify-center rounded-full px-5 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-primeColor hover:shadow-sm"
                      to={link}
                      state={{ data: location.pathname.split("/")[1] }}
                    >
                      <li>{title}</li>
                    </NavLink>
                  ))}
                </>
              </motion.ul>
            )}
            <HiMenuAlt2
              onClick={() => setSidenav(!sidenav)}
              className="inline-block md:hidden cursor-pointer w-8 h-6 absolute top-6 right-4 text-primeColor"
            />
            {sidenav && (
              <div className="fixed top-0 left-0 w-full h-screen bg-black/30 text-gray-600 z-50">
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-[84%] max-w-sm h-full relative"
                >
                  <div className="w-full h-full bg-white p-6 shadow-2xl">
                    <img
                      className="w-40 h-20 mb-6 object-cover"
                      src={Logo}
                      alt="TryNBuy"
                    />
                    <ul className="text-gray-600 flex flex-col gap-2">
                      {navBarList.map((item) => (
                        <li
                          className="rounded-md px-3 py-2 text-base font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                          key={item._id}
                        >
                          <NavLink
                            to={item.link}
                            state={{ data: location.pathname.split("/")[1] }}
                            onClick={() => setSidenav(false)}
                          >
                            {item.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <h1
                        onClick={() => setShowCategory(!showCategory)}
                        className="flex justify-between text-base cursor-pointer items-center font-titleFont mb-2"
                      >
                        Shop by Category{" "}
                        <span className="text-lg">{showCategory ? "-" : "+"}</span>
                      </h1>
                      {showCategory && (
                        <motion.ul
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="text-sm flex flex-col gap-1"
                        >
                          {category.map(({ name, index }) => (
                            <li key={index} className="headerSedenavLi">
                              {name}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </div>
                    <div className="mt-4">
                      <h1
                        onClick={() => setShowBadges(!showBadges)}
                        className="flex justify-between text-base cursor-pointer items-center font-titleFont mb-2"
                      >
                        Shop by Badge
                        <span className="text-lg">{showBadges ? "-" : "+"}</span>
                      </h1>
                      {showBadges && (
                        <motion.ul
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="text-sm flex flex-col gap-1"
                        >
                          {badges.map((badge, index) => (
                            <li key={index} className="headerSedenavLi">
                              {badge}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </div>
                  </div>
                  <span
                    onClick={() => setSidenav(false)}
                    className="w-9 h-9 rounded-full bg-white shadow absolute top-3 -right-12 text-gray-700 text-2xl flex justify-center items-center cursor-pointer hover:text-red-500 duration-300"
                  >
                    <MdClose />
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        </Flex>
      </nav>
    </div>
  );
};

export default Header;
