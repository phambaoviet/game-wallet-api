import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-white">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The wallet page you are attempting to access does not exist.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
          Back to Wallet
        </Button>
      </Link>
    </div>
  );
};
