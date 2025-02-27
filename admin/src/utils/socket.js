const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {withCredentials : true})

export default socket;