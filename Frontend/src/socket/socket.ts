import { io } from "socket.io-client";

export const socket = io(
  "https://indian-oil-quiz.onrender.com",
  {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);

socket.on("connect", () => {
  console.log("✅ Connected to backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend");
});
