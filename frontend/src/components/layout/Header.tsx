import React, { useState } from 'react';
import { LogOut, Menu, X, Coins, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { ApiConfigModal } from '../common/ApiConfigModal';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const { player, logout } = useAuth();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                GW
              </div>
              <div className="leading-tight">
                <span className="font-bold text-base tracking-tight text-white">GAME WALLET</span>
              </div>
            </div>
          </div>

          {/* Right: Balance & User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {player && (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-400 hidden sm:inline">Balance:</span>
                  <span className="text-xs sm:text-sm font-bold text-white font-mono">
                    {formatCurrency(player.balance, player.currency)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsApiModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="API Server Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {player && (
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </>
  );
};
