import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Question, LeaderboardEntry, QuizState, Session, Answer } from '@/types/quiz';
import { socket } from "@/socket/socket";



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

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  timeRemaining,
  onAnswer,
  selectedAnswer,
 showResult = false,
 disabled = false,
}) => {
 if (!question) return null;

  
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
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);


  /* ---------------- FETCH SESSIONS ON LOAD ---------------- */

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('https://indian-oil-quiz.onrender.com/sessions');  // Adjust URL if local
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    fetchSessions();
  }, []);  // Runs once on mount

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

    socket.on("quiz-state-update", (state) => {
      setQuizState(state);
    });

    socket.on("question-display", (question) => {
      setCurrentQuestion(question);
    });

    socket.on("quiz-reset", () => {
      setQuizState({
        currentSession: 1,
        currentQuestion: 0,
        timeRemaining: 0,
        status: "waiting",
      });
      setCurrentQuestion(null);
    });

    return () => {
      socket.off("connect");
      socket.off("participant-joined");
      socket.off("leaderboard-update");
      socket.off("quiz-state-update");
      socket.off("question-display");
      socket.off("quiz-reset");
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

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

    const correct = answer === currentQuestion.correctAnswer;
    socket.emit("submit-answer", {
      email: currentUser.email,
      correct,
    });
  };

  const startSession = (sessionId: number) => {
    socket.emit("start-session", sessionId);  // Emit to backend
  };

  const nextQuestion = () => {
    socket.emit("next-question");
  };

  const endSession = () => {
    socket.emit("end-session");
  };

  const resetQuiz = () => {
    socket.emit("reset-quiz");
  };

  return (
    <QuizContext.Provider
      value={{
        currentUser,
        isAdmin,
        quizState,
        currentQuestion,
        sessions,  // Now from state
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
