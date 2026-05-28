import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io("http://localhost:5000", {
  auth: { token },
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
