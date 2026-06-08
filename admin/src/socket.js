import { io } from "socket.io-client";
import { API_BASE_URL } from "./utils/apiConfig";

const socket = io(API_BASE_URL, { withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
});
export default socket;
