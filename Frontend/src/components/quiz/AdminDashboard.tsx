import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { 
  Play, 
  SkipForward, 
  StopCircle, 
  Users, 
  Trophy, 
  RotateCcw,
  Clock,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Leaderboard } from './Leaderboard';
import { cn } from '@/lib/utils';


export const AdminDashboard: React.FC = () => {
  const { 
    quizState, 
    sessions, 
    participants, 
    leaderboard,
    currentQuestion,
    startSession, 
    nextQuestion, 
    endSession,
    showLeaderboard,
    resetQuiz 
  } = useQuiz();

  const currentSession = sessions[quizState.currentSession - 1];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Quiz Master Control
            </h1>
            <p className="text-muted-foreground mt-1">Manage the quiz in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-secondary rounded-lg px-4 py-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold">{participants.length}</span>
              <span className="text-muted-foreground text-sm">joined</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <div className="quiz-card">
              <h2 className="text-lg font-semibold mb-4">Current Status</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{quizState.currentSession}</div>
                  <div className="text-sm text-muted-foreground">Session</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-accent">{quizState.currentQuestion + 1}</div>
                  <div className="text-sm text-muted-foreground">Question</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <div className={cn(
                    "text-3xl font-bold font-mono",
                    quizState.timeRemaining <= 5 ? "text-destructive" : "text-success"
                  )}>
                    {quizState.timeRemaining}s
                  </div>
                  <div className="text-sm text-muted-foreground">Time Left</div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  quizState.status === 'waiting' && "bg-muted-foreground",
                  quizState.status === 'question' && "bg-success animate-pulse",
                  quizState.status === 'reviewing' && "bg-accent",
                  quizState.status === 'leaderboard' && "bg-primary",
                  quizState.status === 'finished' && "bg-destructive"
                )} />
                <span className="capitalize font-medium">{quizState.status}</span>
              </div>
            </div>

            {/* Current Question Preview */}
            {currentQuestion && (
              <div className="quiz-card">
                <h2 className="text-lg font-semibold mb-4">Current Question</h2>
                <p className="text-xl mb-4">{currentQuestion.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        idx === currentQuestion.correctAnswer 
                          ? "bg-success/20 border border-success" 
                          : "bg-secondary/50"
                      )}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                      {idx === currentQuestion.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 inline ml-2 text-success" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Controls */}
            <div className="quiz-card">
              <h2 className="text-lg font-semibold mb-4">Session Controls</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => startSession(session.id)}
                    disabled={session.questions.length === 0}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      quizState.currentSession === session.id && quizState.status !== 'waiting'
                        ? "border-primary bg-primary/20"
                        : "border-border bg-secondary/50 hover:bg-secondary",
                      session.questions.length === 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="font-bold">Session {session.id}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {session.questions.length} questions
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="quiz-card">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={nextQuestion}
                  disabled={quizState.status === 'waiting'}
                  className="quiz-button-primary flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Next Question
                </button>
                
                <button
                  onClick={showLeaderboard}
                  className="px-6 py-3 rounded-lg font-semibold bg-secondary hover:bg-secondary/80 transition-all flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5 text-accent" />
                  Show Leaderboard
                </button>
                
                <button
                  onClick={endSession}
                  className="px-6 py-3 rounded-lg font-semibold bg-destructive/20 hover:bg-destructive/30 text-destructive transition-all flex items-center gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  End Session
                </button>
                
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 rounded-lg font-semibold bg-muted hover:bg-muted/80 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Live Leaderboard */}
          <div className="space-y-6">
            <Leaderboard entries={leaderboard} showTop={10} title="Live Scores" />
            
            {/* Recent Participants */}
            <div className="quiz-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent Participants
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.slice(-10).reverse().map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm bg-secondary/30 rounded-lg p-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

