import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gift, ArrowLeftRight, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, Clock, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { walletApi, transactionApi } from '../api/player';
import { Transaction } from '../types/player';
import { formatCurrency, formatDate, formatApiError } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { player, refreshProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  const fetchRecentTransactions = useCallback(async () => {
    setIsLoadingTx(true);
    try {
      const res = await transactionApi.listMine(1, 5);
      setRecentTransactions(res.data.slice(0, 5));
    } catch {
      // Backend might have empty transactions or new player with 0 tx
      setRecentTransactions([]);
    } finally {
      setIsLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    if (player) {
      fetchRecentTransactions();
    }
  }, [player, fetchRecentTransactions]);

  const handleClaimCoins = async () => {
    setIsClaiming(true);
    setClaimStatus(null);

    try {
      const res = await walletApi.claim();
      // Immediately refresh authoritative profile
      await refreshProfile();
      // Immediately refresh transaction history
      await fetchRecentTransactions();

      setClaimStatus({
        type: 'success',
        message: res.message || 'Successfully claimed 10,000 demo coins!',
      });
    } catch (err: any) {
      console.error('Claim error:', err);
      const friendlyMsg = formatApiError(err);
      setClaimStatus({
        type: 'error',
        message: friendlyMsg,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading && !player) {
    return <LoadingSpinner fullScreen label="Loading wallet..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Welcome, <span className="text-emerald-400">{player?.username || 'Player'}</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Player ID: <span className="text-slate-300 font-bold">{player?.id}</span>
        </p>
      </div>

      {/* Claim Status Notification */}
      {claimStatus && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
            claimStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {claimStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{claimStatus.message}</p>
          </div>
          <button
            onClick={() => setClaimStatus(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Balance Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Wallet Balance
          </span>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(player?.balance ?? 0, player?.currency || 'COIN')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Button
            onClick={handleClaimCoins}
            isLoading={isClaiming}
            variant="primary"
            leftIcon={<Gift className="w-4 h-4" />}
            size="md"
          >
            {isClaiming ? 'Claiming...' : 'Claim 10,000 Coins'}
          </Button>

          <Button
            onClick={() => navigate('/transfers')}
            variant="secondary"
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
            size="md"
          >
            Transfer
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Transactions
            </h2>
          </div>
          {recentTransactions.length > 0 && (
            <Link
              to="/transactions"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
            >
              View all →
            </Link>
          )}
        </div>

        {isLoadingTx ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Loading recent transactions...
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-1">
            <Clock className="w-6 h-6 mx-auto text-slate-600 mb-2" />
            <p>No recent transactions recorded.</p>
            <p className="text-slate-600">Claim faucet coins or send a transfer to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance After</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentTransactions.map((tx) => {
                  const txType = (tx.transaction_type || tx.type || '').toUpperCase();
                  const isNegative = txType === 'TRANSFER_OUT' || txType === 'WITHDRAWAL';
                  const isPositive = txType === 'TRANSFER_IN' || txType === 'DEMO_FAUCET' || txType === 'DEPOSIT';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                            isNegative
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isNegative ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" />
                          )}
                          {txType || 'TRANSFER'}
                        </span>
                      </td>

                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isNegative ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isNegative ? '-' : '+'}
                        {formatCurrency(Math.abs(tx.amount), '')}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-300">
                        {formatCurrency(tx.balance_after, '')}
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-sans text-xs max-w-[200px] truncate">
                        {tx.description || '—'}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-400 font-sans text-[11px] whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
