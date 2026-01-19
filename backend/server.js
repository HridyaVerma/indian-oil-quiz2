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
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

/* ---------------- DATA ---------------- */

let participants = [];

// Sample questions (move to DB if needed)
const sampleQuestions = [
  {
    id: 'q1',
    sessionId: 1,
    questionNumber: 1,
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    timeLimit: 15,
  },
  {
    id: 'q2',
    sessionId: 1,
    questionNumber: 2,
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    timeLimit: 15,
  },
];

const sessions = [
  { id: 1, name: 'General Knowledge', questions: sampleQuestions, status: 'pending' },
  { id: 2, name: 'Literature & Geography', questions: [], status: 'pending' },
  { id: 3, name: 'Science & Tech', questions: [], status: 'pending' },
];

// Global quiz state
let quizState = {
  currentSession: 1,
  currentQuestion: 0,
  timeRemaining: 0,
  status: 'waiting',
};


app.get('/sessions', (req, res) => {
39  res.json(sessions);
40});

/* ---------------- SOCKET EVENTS ---------------- */

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Send current state to new user
  socket.emit("quiz-state-update", quizState);
  socket.emit("participant-joined", participants);

  // Admin joins
  socket.on("admin-joined", () => {
    console.log("🧠 Admin joined");
    socket.emit("participant-joined", participants);
    socket.emit("quiz-state-update", quizState);
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

  // Start session (admin clicks session)
  socket.on("start-session", (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.questions.length === 0) return;

    quizState = {
      currentSession: sessionId,
      currentQuestion: 0,
      timeRemaining: session.questions[0].timeLimit,
      status: "question",
    };

    io.emit("quiz-state-update", quizState);
    io.emit("question-display", session.questions[0]);  // Broadcast first question
    console.log(`🎯 Session ${sessionId} started`);
  });

  // Next question
  socket.on("next-question", () => {
    const session = sessions[quizState.currentSession - 1];
    const next = quizState.currentQuestion + 1;

    if (next >= session.questions.length) {
      quizState.status = "leaderboard";
      io.emit("quiz-state-update", quizState);
      return;
    }

    quizState = {
      ...quizState,
      currentQuestion: next,
      timeRemaining: session.questions[next].timeLimit,
      status: "question",
    };

    io.emit("quiz-state-update", quizState);
    io.emit("question-display", session.questions[next]);
  });

  // End session
  socket.on("end-session", () => {
    quizState.status = "leaderboard";
    io.emit("quiz-state-update", quizState);
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
    quizState = {
      currentSession: 1,
      currentQuestion: 0,
      timeRemaining: 0,
      status: "waiting",
    };
    io.emit("participant-joined", participants);
    io.emit("quiz-state-update", quizState);
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
