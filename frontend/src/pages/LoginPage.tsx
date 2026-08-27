import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ApiConfigModal } from '../components/common/ApiConfigModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { apiUrl } = useApi();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    try {
      // login() handles token save, GET /players/me, and sets authoritative player state
      await login({ email: email.trim(), password });
      navigate('/', { replace: true });
    } catch (err: any) {
      // Error already set in AuthContext / local error
      console.error('Login submit error:', err);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl items-center justify-center text-emerald-400 font-black text-base mb-1">
            GW
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Game Wallet
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your wallet & transfer coins
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Account Login
            </h2>
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors bg-slate-950 px-2 py-1 rounded-lg border border-slate-800"
              title="API Server URL"
            >
              <Settings className="w-3 h-3" />
              <span className="font-mono text-[11px] truncate max-w-[120px]">
                {apiUrl.replace(/^https?:\/\//, '')}
              </span>
            </button>
          </div>

          {activeError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{activeError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError(null);
              }}
              placeholder="Email"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError(null);
              }}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              autoComplete="current-password"
              required
            />

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-emerald-400 hover:underline font-semibold"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Go Gin Backend • JWT Authentication
        </div>
      </div>

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
};
