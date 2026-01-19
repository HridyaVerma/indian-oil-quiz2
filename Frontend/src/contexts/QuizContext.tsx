import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Question, LeaderboardEntry, QuizState, Session, Answer } from '@/types/quiz';
import { socket } from "@/socket/socket";

/* ---------------- QUESTIONS ---------------- */

const sampleQuestions: Question[] = [
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

const sessions: Session[] = [
  { id: 1, name: 'General Knowledge', questions: sampleQuestions, status: 'pending' },
  { id: 2, name: 'Literature & Geography', questions: [], status: 'pending' },
  { id: 3, name: 'Science & Tech', questions: [], status: 'pending' },
];

interface QuizContextType {
  currentUser: User | null;
  isAdmin: boolean;
  quizState: QuizState;
  currentQuestion: Question | null;
  sessions: Session[];
  leaderboard: LeaderboardEntry[];
  participants: User[];

  registerUser: (name: string, email: string) => Promise<boolean>;
  loginAsAdmin: () => void;
  submitAnswer: (answer: number) => void;

  startSession: (sessionId: number) => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside QuizProvider");
  return ctx;
};

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentSession: 1,
    currentQuestion: 0,
    timeRemaining: 0,
    status: 'waiting',
  });

  const currentQuestion =
    quizState.status === 'question'
      ? sessions[quizState.currentSession - 1]?.questions[quizState.currentQuestion]
      : null;

  /* ---------------- SOCKET CONNECTION ---------------- */

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("participant-joined", (users) => {
      setParticipants(users);
    });

    socket.on("leaderboard-update", (data) => {
      setLeaderboard(data);
    });

    socket.on("quiz-reset", () => {
      setQuizState({
        currentSession: 1,
        currentQuestion: 0,
        timeRemaining: 0,
        status: "waiting",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("participant-joined");
      socket.off("leaderboard-update");
      socket.off("quiz-reset");
    };
  }, []);



  useEffect(() => {
  if (!isAdmin) return;

  // Ask backend for current participants when admin opens dashboard
  socket.emit("admin-joined");

  socket.on("participant-joined", (users) => {
    setParticipants(users);
  });

  return () => {
    socket.off("participant-joined");
  };
}, [isAdmin]);

  /* ---------------- TIMER ---------------- */

useEffect(() => {
  if (quizState.status !== "question") return;

  const interval = setInterval(() => {
    setQuizState((prev) => {
      if (prev.timeRemaining <= 1) {
        return {
          ...prev,
          timeRemaining: 0,
          status: "reviewing",
        };
      }

      return {
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      };
    });
  }, 1000);

  return () => clearInterval(interval);
}, [quizState.status, quizState.timeRemaining]);

  /* ---------------- ACTIONS ---------------- */

  const registerUser = async (name: string, email: string) => {
    socket.emit("register-user", { name, email });

    setCurrentUser({
      id: email,
      name,
      email,
      registeredAt: new Date(),
      totalScore: 0,
    });

    return true;
  };

  const loginAsAdmin = () => {
    setIsAdmin(true);
    setCurrentUser({
      id: "admin",
      name: "Quiz Master",
      email: "admin@conclave.com",
      registeredAt: new Date(),
      totalScore: 0,
    });
  };

  const submitAnswer = (answer: number) => {
    if (!currentUser || !currentQuestion) return;

    socket.emit("submit-answer", {
      email: currentUser.email,
      answer,
    });
  };

  const startSession = (sessionId: number) => {
    socket.emit("start-session", sessionId);

    const firstQ = sessions[sessionId - 1].questions[0];
    setQuizState({
      currentSession: sessionId,
      currentQuestion: 0,
      timeRemaining: firstQ.timeLimit,
      status: "question",
    });
  };

  const nextQuestion = () => {
    socket.emit("next-question");

    const session = sessions[quizState.currentSession - 1];
    const next = quizState.currentQuestion + 1;

    if (next >= session.questions.length) {
      setQuizState(prev => ({ ...prev, status: "leaderboard" }));
      return;
    }

    setQuizState({
      currentSession: quizState.currentSession,
      currentQuestion: next,
      timeRemaining: session.questions[next].timeLimit,
      status: "question",
    });
  };

  const endSession = () => {
    socket.emit("end-session");
    setQuizState(prev => ({ ...prev, status: "leaderboard" }));
  };

  const resetQuiz = () => {
    socket.emit("reset-quiz");
    setQuizState({
      currentSession: 1,
      currentQuestion: 0,
      timeRemaining: 0,
      status: "waiting",
    });
  };

  return (
    <QuizContext.Provider
      value={{
        currentUser,
        isAdmin,
        quizState,
        currentQuestion,
        sessions,
        leaderboard,
        participants,
        registerUser,
        loginAsAdmin,
        submitAnswer,
        startSession,
        nextQuestion,
        endSession,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
