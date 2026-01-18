export interface User {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
  totalScore: number;
  rank?: number;
}

export interface Question {
  id: string;
  sessionId: number;
  questionNumber: number;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number; // in seconds
}

export interface Answer {
  userId: string;
  questionId: string;
  answer: number;
  timeTaken: number; // in milliseconds
  submittedAt: Date;
  isCorrect: boolean;
  score: number;
  submissionOrder: number;
}

export interface Session {
  id: number;
  name: string;
  questions: Question[];
  status: 'pending' | 'active' | 'completed';
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  score: number;
  rank: number;
  sessionScores: { [sessionId: number]: number };
}

export interface QuizState {
  currentSession: number;
  currentQuestion: number;
  timeRemaining: number;
  status: 'waiting' | 'question' | 'reviewing' | 'leaderboard' | 'finished';
  questionStartTime?: Date;
}

export type UserRole = 'participant' | 'admin';
