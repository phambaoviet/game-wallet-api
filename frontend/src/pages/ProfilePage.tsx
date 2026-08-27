import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Coins, Copy, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { player, refreshProfile, isLoading } = useAuth();
  const [copiedId, setCopiedId] = useState(false);

  if (!player) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(String(player.id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Player Profile</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authoritative player account details from <code className="text-emerald-400 font-mono">GET /players/me</code>
          </p>
        </div>

        <Button
          onClick={refreshProfile}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Sync Profile
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-lg">
            {player.username ? player.username.substring(0, 2).toUpperCase() : 'PL'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{player.username}</h2>
              {player.role && (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  player.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {player.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">Player ID: #{player.id}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Player ID */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider">
                <User className="w-3.5 h-3.5 text-slate-400" /> Player ID
              </span>
              <button
                onClick={handleCopyId}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-medium"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-sm font-bold text-white">{player.id}</p>
          </div>

          {/* Email */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider text-slate-400 text-xs">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </span>
            <p className="text-sm font-medium text-slate-200 truncate">
              {player.email || '—'}
            </p>
          </div>

          {/* Wallet Balance */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider text-slate-400 text-xs">
              <Coins className="w-3.5 h-3.5 text-emerald-400" /> Current Balance
            </span>
            <p className="font-mono text-sm font-bold text-emerald-400">
              {formatCurrency(player.balance, player.currency)}
            </p>
          </div>

          {/* Account Role */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider text-slate-400 text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> Account Role
            </span>
            <p className="text-sm font-medium text-slate-200 capitalize">
              {player.role || 'Standard Player'}
            </p>
          </div>

          {/* Created Date */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 sm:col-span-2">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider text-slate-400 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Account Created
            </span>
            <p className="text-xs text-slate-300 font-mono">
              {formatDate(player.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
