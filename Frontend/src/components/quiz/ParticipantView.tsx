import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { WaitingRoom } from './WaitingRoom';
import { QuestionCard } from './QuestionCard';
import { Leaderboard } from './Leaderboard';
import { Trophy, PartyPopper, RotateCcw } from 'lucide-react';

export const ParticipantView: React.FC = () => {
  const { 
    currentUser, 
    quizState, 
    currentQuestion, 
    leaderboard,
    userAnswers,
    submitAnswer 
  } = useQuiz();

  // Get user's answer for current question
  const userAnswer = currentQuestion 
    ? userAnswers.get(`${currentUser?.id}_${currentQuestion.id}`)
    : undefined;

  if (quizState.status === 'waiting') {
    return <WaitingRoom />;
  }

  if (quizState.status === 'question' || quizState.status === 'reviewing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            timeRemaining={quizState.timeRemaining}
            onAnswer={submitAnswer}
            selectedAnswer={userAnswer?.answer}
            showResult={quizState.status === 'reviewing'}
            disabled={quizState.status === 'reviewing'}
          />
        )}
      </div>
    );
  }

  if (quizState.status === 'leaderboard') {
    const userRank = leaderboard.find(e => e.userId === currentUser?.id);
    
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* User's position highlight */}
          {userRank && userRank.rank <= 3 && (
            <div className="text-center mb-8 slide-up">
              <PartyPopper className="w-16 h-16 mx-auto text-accent mb-4" />
              <h2 className="text-2xl font-bold">
                {userRank.rank === 1 && "🏆 You're in 1st Place!"}
                {userRank.rank === 2 && "🥈 You're in 2nd Place!"}
                {userRank.rank === 3 && "🥉 You're in 3rd Place!"}
              </h2>
            </div>
          )}
          
          <Leaderboard 
            entries={leaderboard} 
            currentUserId={currentUser?.id}
            title={`Session ${quizState.currentSession} Results`}
          />
          
          <div className="text-center mt-8 text-muted-foreground">
            <p>Waiting for next session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizState.status === 'finished') {
    const userRank = leaderboard.find(e => e.userId === currentUser?.id);
    
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Trophy className="w-24 h-24 mx-auto text-accent mb-6" />
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for participating in the Corporate Conclave Quiz!
          </p>
          
          {userRank && (
            <div className="quiz-card mb-8 inline-block">
              <p className="text-lg">Your Final Rank</p>
              <p className="text-5xl font-bold text-accent mt-2">#{userRank.rank}</p>
              <p className="text-muted-foreground mt-2">{userRank.score} points</p>
            </div>
          )}
          
          <Leaderboard 
            entries={leaderboard} 
            currentUserId={currentUser?.id}
            title="Final Standings"
          />
        </div>
      </div>
    );
  }

  return <WaitingRoom />;
};
