import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/socket/socket";
import { User, Question, QuizState, Session } from "@/types/quiz";

const QuizContext = createContext<any>(null);
export const useQuiz = () => useContext(QuizContext);

/* ---------------- QUESTIONS ---------------- */

const sampleQuestions: Question[] = [
  {
    id: "q1",
    sessionId: 1,
    questionNumber: 1,
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    timeLimit: 15,
  },
  {
    id: "q2",
    sessionId: 1,
    questionNumber: 2,
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    timeLimit: 15,
  },
];

const sessions: Session[] = [
  { id: 1, name: "General Knowledge", questions: sampleQuestions, status: "pending" },
  { id: 2, name: "Literature", questions: [], status: "pending" },
  { id: 3, name: "Science", questions: [], status: "pending" },
];

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentSession: 0,
    currentQuestion: 0,
    timeRemaining: 0,
    status: "waiting",
  });

  /* ✅ FIXED CURRENT QUESTION */
  const currentQuestion =
    quizState.status === "question"
      ? sessions.find(s => s.id === quizState.currentSession)
          ?.questions[quizState.currentQuestion] || null
      : null;

  /* ---------------- SOCKET LISTENERS ---------------- */

  useEffect(() => {
    socket.on("participant-joined", setParticipants);

    socket.on("session-started", (state) => {
      console.log("📢 SESSION RECEIVED:", state);
      setQuizState(state);
    });

    socket.on("quiz-reset", () => {
      setQuizState({
        currentSession: 0,
        currentQuestion: 0,
        timeRemaining: 0,
        status: "waiting",
      });
    });

    return () => {
      socket.off("participant-joined");
      socket.off("session-started");
      socket.off("quiz-reset");
    };
  }, []);

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (quizState.status !== "question") return;

    const timer = setInterval(() => {
      setQuizState((prev) => ({
        ...prev,
        timeRemaining: Math.max(prev.timeRemaining - 1, 0),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.status]);

  /* ---------------- ACTIONS ---------------- */

  const registerUser = (name: string, email: string) => {
    socket.emit("register-user", { name, email });

    setCurrentUser({
      id: email,
      name,
      email,
      totalScore: 0,
    });
  };

  const startSession = (sessionId: number) => {
    socket.emit("start-session", sessionId);
  };

  const nextQuestion = () => {
    socket.emit("next-question");
  };

  const submitAnswer = (answer: number) => {
    if (!currentUser || !currentQuestion) return;

    socket.emit("submit-answer", {
      email: currentUser.email,
      correct: answer === currentQuestion.correctAnswer,
    });
  };

  return (
    <QuizContext.Provider
      value={{
        currentUser,
        participants,
        quizState,
        currentQuestion,
        sessions,
        registerUser,
        startSession,
        nextQuestion,
        submitAnswer,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
