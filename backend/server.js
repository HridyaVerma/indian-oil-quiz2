import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ---------------- SOCKET SETUP ---------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

/* ---------------- DATA ---------------- */

let participants = [];

/* ---------------- SOCKET EVENTS ---------------- */

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Send current participants immediately
  socket.emit("participant-joined", participants);

  // Admin joins
  socket.on("admin-joined", () => {
    console.log("🧠 Admin joined");
    socket.emit("participant-joined", participants);
  });

  // User registration
  socket.on("register-user", ({ name, email }) => {
    if (!name || !email) return;

    const exists = participants.find((p) => p.email === email);
    if (exists) return;

    const newUser = {
      id: socket.id,
      name,
      email,
      score: 0,
    };

    participants.push(newUser);
    console.log("✅ User joined:", name);

    io.emit("participant-joined", participants);
  });

  // Answer submission
  socket.on("submit-answer", ({ email, correct }) => {
    const user = participants.find((p) => p.email === email);
    if (!user) return;

    if (correct) user.score += 10;

    io.emit("leaderboard-update", [...participants]);
  });

  // Reset quiz
  socket.on("reset-quiz", () => {
    participants = [];
    io.emit("participant-joined", participants);
    console.log("♻️ Quiz reset");
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    participants = participants.filter(
      (p) => p.id !== socket.id
    );

    io.emit("participant-joined", participants);
  });
});

/* ---------------- SERVER ---------------- */

app.get("/", (req, res) => {
  res.send("✅ Quiz backend running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
