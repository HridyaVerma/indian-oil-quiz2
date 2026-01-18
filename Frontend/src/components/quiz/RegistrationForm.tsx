import React, { useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { User, Mail, Loader2, AlertCircle, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_PASSWORD = "admin@123"; // 🔐 Change this later

export const RegistrationForm: React.FC = () => {
  const { registerUser, loginAsAdmin } = useQuiz();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await registerUser(name.trim(), email.trim().toLowerCase());
      if (!success) {
        setError('This email is already registered.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword !== ADMIN_PASSWORD) {
      setAdminError("Invalid admin password");
      return;
    }

    setAdminError('');
    setShowAdminModal(false);
    loginAsAdmin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="quiz-card w-full max-w-md slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center pulse-glow">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Corporate Conclave</h1>
          <p className="text-muted-foreground">Quiz Championship 2024</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                className="quiz-input w-full pl-12"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                className="quiz-input w-full pl-12"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="quiz-button-primary w-full"
          >
            {isLoading ? "Registering..." : "Join the Quiz"}
          </button>
        </form>

        {/* Admin Access */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <button
            onClick={() => setShowAdminModal(true)}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mx-auto"
          >
            <Shield className="w-4 h-4" />
            Enter as Quiz Master
          </button>
        </div>
      </div>

      {/* ADMIN PASSWORD MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl w-full max-w-sm slide-up">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Admin Access
            </h3>

            <input
              type="password"
              placeholder="Enter admin password"
              className="quiz-input w-full mb-3"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />

            {adminError && (
              <p className="text-sm text-destructive mb-3">{adminError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border"
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </button>
              <button
                className="quiz-button-primary"
                onClick={handleAdminLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};