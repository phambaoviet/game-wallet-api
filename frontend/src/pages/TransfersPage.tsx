import React, { useState, useEffect, useCallback } from 'react';
import { Send, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playerApi, transactionApi } from '../api/player';
import { Transaction } from '../types/player';
import { formatCurrency, formatDate, formatApiError } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const TransfersPage: React.FC = () => {
  const { player, refreshProfile } = useAuth();

  const [recipientId, setRecipientId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [transfers, setTransfers] = useState<Transaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const fetchTransfers = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await transactionApi.listMine(1, 10);
      setTransfers(res.data);
    } catch {
      setTransfers([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const currentBalance = player?.balance ?? 0;
  const numRecipientId = parseInt(recipientId, 10);
  const numAmount = parseFloat(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!recipientId.trim() || isNaN(numRecipientId) || numRecipientId < 1) {
      setErrorMessage('Please enter a valid numeric Recipient Player ID (minimum 1).');
      return;
    }

    if (player && numRecipientId === player.id) {
      setErrorMessage('You cannot transfer coins to your own account.');
      return;
    }

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    if (numAmount > currentBalance) {
      setErrorMessage(`Insufficient balance. Your current balance is ${formatCurrency(currentBalance, player?.currency)}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend expects exact payload: { receiver_player_id: number, amount: number }
      const res = await playerApi.transfer({
        receiver_player_id: numRecipientId,
        amount: Math.floor(numAmount), // Go backend expects int64
      });

      // 1. Authoritative refresh of GET /players/me to update balance immediately
      await refreshProfile();

      // 2. Refresh transaction list
      await fetchTransfers();

      // 3. Clear form and display success
      setSuccessMessage(
        res.message || `Successfully transferred ${formatCurrency(numAmount, player?.currency)} to Player ID ${numRecipientId}.`
      );
      setRecipientId('');
      setAmount('');
    } catch (err: any) {
      console.error('Transfer error:', err);
      setErrorMessage(formatApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Transfer Coins</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Send coins directly to another player by Player ID
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Transfer Form Card */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Recipient Player ID */}
            <Input
              label="Recipient Player ID"
              type="number"
              min="1"
              step="1"
              value={recipientId}
              onChange={(e) => {
                setRecipientId(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="e.g. 338"
              hint="Enter the numeric ID of the recipient"
              required
            />

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Amount
                </label>
                <span className="text-slate-400 font-mono">
                  Available: <span className="text-emerald-400 font-bold">{formatCurrency(currentBalance, player?.currency)}</span>
                </span>
              </div>

              <Input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="0"
                required
              />

              {/* Quick Amount presets */}
              <div className="flex items-center gap-2 pt-1">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(String(val));
                      setErrorMessage(null);
                    }}
                    className="flex-1 py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting || !recipientId || !amount}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Sending...' : 'Send Coins'}
              </Button>
            </div>
          </form>
        </div>

        {/* Recent Transfer Activity column */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              Transfer Activity
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Latest 10</span>
          </div>

          {isLoadingHistory ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading transfers...</div>
          ) : transfers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transfers yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {transfers.map((tx) => {
                const txType = (tx.transaction_type || tx.type || '').toUpperCase();
                const isOut = txType === 'TRANSFER_OUT';
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isOut
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {isOut ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans font-medium text-slate-200 truncate">
                          {tx.description || txType || 'Transfer'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold ${
                          isOut ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isOut ? '-' : '+'}
                        {formatCurrency(Math.abs(tx.amount), '')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
