import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

let participants = [];
let leaderboard = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register-user", (user) => {
    const exists = participants.find(p => p.email === user.email);
    if (exists) return;

    participants.push({
      id: socket.id,
      name: user.name,
      email: user.email,
      score: 0,
    });

    io.emit("participant-joined", participants);
  });

  socket.on("submit-answer", ({ email, correct }) => {
    const user = participants.find(p => p.email === email);
    if (user && correct) user.score += 10;

    leaderboard = [...participants].sort((a, b) => b.score - a.score);
    io.emit("leaderboard-update", leaderboard);
  });

  socket.on("reset-quiz", () => {
    participants = [];
    leaderboard = [];
    io.emit("quiz-reset");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});