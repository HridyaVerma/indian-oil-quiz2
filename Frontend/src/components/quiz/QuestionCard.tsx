import React, { useState } from 'react';
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Timer } from './Timer';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  timeRemaining: number;
  onAnswer: (index: number) => void;
  selectedAnswer?: number;
  showResult?: boolean;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  timeRemaining,
  onAnswer,
  selectedAnswer,
  showResult = false,
  disabled = false,
}) => {
  const [localSelected, setLocalSelected] = useState<number | null>(null);
  const selected = selectedAnswer ?? localSelected;

  const handleSelect = (index: number) => {
    if (disabled || selected !== null) return;
    setLocalSelected(index);
    onAnswer(index);
  };

  const getOptionClasses = (index: number) => {
    const base = "answer-option w-full text-lg";
    
    if (showResult) {
      if (index === question.correctAnswer) {
        return cn(base, "correct");
      }
      if (selected === index && index !== question.correctAnswer) {
        return cn(base, "incorrect");
      }
    } else if (selected === index) {
      return cn(base, "selected");
    }
    
    return base;
  };

  return (
    <div className="quiz-card max-w-3xl w-full mx-auto slide-up">
      <div className="flex flex-col items-center gap-8">
        {/* Timer */}
        <Timer seconds={timeRemaining} maxSeconds={question.timeLimit} />
        
        {/* Session & Question info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-secondary">
            Session {question.sessionId}
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary">
            Question {question.questionNumber}
          </span>
        </div>
        
        {/* Question text */}
        <h2 className="text-2xl md:text-3xl font-bold text-center leading-relaxed">
          {question.text}
        </h2>
        
        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={disabled || selected !== null}
              className={getOptionClasses(index)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && index === question.correctAnswer && (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                )}
                {showResult && selected === index && index !== question.correctAnswer && (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Feedback message */}
        {showResult && selected !== null && (
          <div className={cn(
            "text-lg font-semibold fade-in",
            selected === question.correctAnswer ? "text-success" : "text-destructive"
          )}>
            {selected === question.correctAnswer 
              ? "🎉 Correct! Great job!" 
              : `❌ Wrong! The answer was: ${question.options[question.correctAnswer]}`
            }
          </div>
        )}
        
        {selected !== null && !showResult && (
          <div className="text-muted-foreground fade-in">
            Answer locked! Waiting for time to end...
          </div>
        )}
      </div>
    </div>
  );
};
