import React from 'react';
import { LeaderboardEntry } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showTop?: number;
  title?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  showTop = 10,
  title = "Leaderboard",
}) => {
  const topEntries = entries.slice(0, showTop);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, showTop);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "leaderboard-gold text-primary-foreground";
      case 2:
        return "leaderboard-silver text-primary-foreground";
      case 3:
        return "leaderboard-bronze text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (entries.length === 0) {
    return (
      <div className="quiz-card text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No scores yet. Start playing!</p>
      </div>
    );
  }

  return (
    <div className="quiz-card w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
        <Trophy className="w-8 h-8 text-accent" />
        {title}
      </h2>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8 px-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center rank-bounce" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 rounded-full leaderboard-silver flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">2</span>
            </div>
            <div className="text-center">
              <p className="font-semibold truncate max-w-[100px]">{top3[1]?.name}</p>
              <p className="text-accent font-mono text-lg">{top3[1]?.score}</p>
            </div>
          </div>
          
          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-8 rank-bounce">
            <Crown className="w-10 h-10 text-yellow-400 mb-2" />
            <div className="w-24 h-24 rounded-full leaderboard-gold flex items-center justify-center mb-2 pulse-glow">
              <span className="text-3xl font-bold">1</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg truncate max-w-[120px]">{top3[0]?.name}</p>
              <p className="text-accent font-mono text-xl">{top3[0]?.score}</p>
            </div>
          </div>
          
          {/* 3rd Place */}
          <div className="flex flex-col items-center rank-bounce" style={{ animationDelay: '0.2s' }}>
            <div className="w-20 h-20 rounded-full leaderboard-bronze flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">3</span>
            </div>
            <div className="text-center">
              <p className="font-semibold truncate max-w-[100px]">{top3[2]?.name}</p>
              <p className="text-accent font-mono text-lg">{top3[2]?.score}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((entry, idx) => (
          <div
            key={entry.userId}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg transition-all duration-200",
              entry.userId === currentUserId ? "bg-primary/20 border border-primary" : "bg-secondary/50",
              "slide-up"
            )}
            style={{ animationDelay: `${(idx + 3) * 0.05}s` }}
          >
            <span className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              getRankBadgeClass(entry.rank)
            )}>
              {entry.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {entry.name}
                {entry.userId === currentUserId && (
                  <span className="ml-2 text-xs text-primary">(You)</span>
                )}
              </p>
            </div>
            <span className="font-mono text-lg text-accent font-bold">
              {entry.score}
            </span>
          </div>
        ))}
      </div>

      {/* Current user if not in top */}
      {currentUserId && !topEntries.find(e => e.userId === currentUserId) && (
        <>
          <div className="flex items-center justify-center gap-2 my-4 text-muted-foreground">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
          {entries.filter(e => e.userId === currentUserId).map(entry => (
            <div
              key={entry.userId}
              className="flex items-center gap-4 p-3 rounded-lg bg-primary/20 border border-primary"
            >
              <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                {entry.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.name} <span className="text-xs text-primary">(You)</span>
                </p>
              </div>
              <span className="font-mono text-lg text-accent font-bold">
                {entry.score}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
