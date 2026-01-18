import React from 'react';
import { QuizProvider, useQuiz } from '@/contexts/QuizContext';
import { RegistrationForm } from '@/components/quiz/RegistrationForm';
import { AdminDashboard } from '@/components/quiz/AdminDashboard';
import { ParticipantView } from '@/components/quiz/ParticipantView';

const QuizApp: React.FC = () => {
  const { currentUser, isAdmin } = useQuiz();

  if (!currentUser) {
    return <RegistrationForm />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <ParticipantView />;
};

const Index: React.FC = () => {
  return (
    <QuizProvider>
      <div className="min-h-screen bg-background">
        <QuizApp />
      </div>
    </QuizProvider>
  );
};

export default Index;
