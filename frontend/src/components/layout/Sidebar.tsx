import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, ArrowLeftRight, History, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { player } = useAuth();
  const isAdmin = player?.role === 'admin';

  const baseNavItems = [
    {
      label: 'Wallet',
      path: '/',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      label: 'Transfer',
      path: '/transfers',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      label: 'Transactions',
      path: '/transactions',
      icon: <History className="w-4 h-4" />,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <User className="w-4 h-4" />,
    },
  ];

  const adminNavItems = [
    {
      label: 'Admin Transactions',
      path: '/admin/transactions',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3.5 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] text-slate-300">
      <div className="space-y-6">
        
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Menu
          </p>
          {baseNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Admin Navigation (ONLY if player.role === 'admin') */}
        {isAdmin && (
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-500/90 mb-2 flex items-center gap-1.5">
              <span>Admin</span>
            </p>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* User Compact Card */}
      {player && (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 truncate">{player.username}</span>
            {player.role && (
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                player.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {player.role}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">ID: {player.id}</p>
        </div>
      )}
    </aside>
  );
};
