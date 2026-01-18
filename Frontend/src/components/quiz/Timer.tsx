import React from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  seconds: number;
  maxSeconds: number;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ seconds, maxSeconds, className }) => {
  const percentage = (seconds / maxSeconds) * 100;
  const isLow = seconds <= 5;
  const isCritical = seconds <= 3;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "quiz-timer transition-colors duration-300",
          isCritical ? "text-destructive countdown-pulse" : isLow ? "text-accent" : "text-primary"
        )}
      >
        {seconds}
      </div>
      
      <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-full",
            isCritical ? "bg-destructive" : isLow ? "bg-accent" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <span className="text-sm text-muted-foreground uppercase tracking-wider">
        seconds remaining
      </span>
    </div>
  );
};
