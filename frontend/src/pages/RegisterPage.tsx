import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, AlertCircle, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ApiConfigModal } from '../components/common/ApiConfigModal';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const { apiUrl } = useApi();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username.trim()) {
      setLocalError('Please choose a username');
      return;
    }

    if (!password || password.length < 4) {
      setLocalError('Password must be at least 4 characters');
      return;
    }

    try {
      // register() handles POST /players, auto login if needed, GET /players/me, sets authoritative player
      await register({
        username: username.trim(),
        email: email.trim() || undefined,
        password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Register submit error:', err);
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
            Create Account
          </h1>
          <p className="text-xs text-slate-400">
            Register a player account on Game Wallet
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Register Player
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
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setLocalError(null);
              }}
              placeholder="e.g. player123"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              autoComplete="username"
              required
            />

            <Input
              label="Email (Optional)"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError(null);
              }}
              placeholder="player@example.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
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
              autoComplete="new-password"
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
                {isLoading ? 'Creating Account...' : 'Register'}
              </Button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
              Sign In
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
