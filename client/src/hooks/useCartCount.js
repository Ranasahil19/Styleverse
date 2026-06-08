import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/ApiConfig";

const useCartCount = (userId) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    let isMounted = true;

    const fetchCartCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart/count/${userId}`);
        if (isMounted) {
          setCartCount(response.data.count);
        }
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();

    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
    });

    socket.emit("registerCart", userId);

    socket.on("cartCountUpdated", (data) => {
      if (data?.userId === userId) {
        setCartCount(data.count);
      }
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [userId]);

  return cartCount;
};

export default useCartCount;
