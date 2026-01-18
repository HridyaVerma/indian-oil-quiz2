import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Users, Clock, Zap } from 'lucide-react';

export const WaitingRoom: React.FC = () => {
  const { currentUser, participants, sessions, quizState } = useQuiz();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="quiz-card w-full max-w-lg text-center slide-up">
        {/* Welcome message */}
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center pulse-glow">
            <Zap className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser?.name}! 👋</h1>
          <p className="text-muted-foreground">You're all set for the quiz</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-secondary/50 rounded-xl p-4">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{participants.length}</div>
            <div className="text-sm text-muted-foreground">Participants</div>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4">
            <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{sessions.length}</div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-secondary/30 rounded-xl p-6 border border-border">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <span className="font-medium">Waiting for Quiz Master</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The quiz will begin shortly. Stay on this page and get ready!
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-left space-y-3">
          <h3 className="font-semibold text-lg">How it works:</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Questions appear one at a time with a timer
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Faster correct answers earn more points
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Leaderboard updates after each session
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Top 3 participants will be highlighted!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
