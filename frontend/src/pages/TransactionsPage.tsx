import React, { useState, useEffect, useCallback } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { transactionApi } from '../api/player';
import { Transaction } from '../types/player';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);

  const fetchTransactions = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    try {
      const res = await transactionApi.listMine(targetPage, limit);
      setTransactions(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  const hasNextPage = transactions.length === limit || (total > 0 && page * limit < total);
  const hasPrevPage = page > 1;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Wallet ledger entries and transfer records
          </p>
        </div>

        <Button
          onClick={() => fetchTransactions(page)}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading transaction history...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-1">
            <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>No transactions found on this account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.map((tx) => {
                  const txType = (tx.transaction_type || tx.type || '').toUpperCase();
                  const isNegative = txType === 'TRANSFER_OUT' || txType === 'WITHDRAWAL';
                  const isPositive = txType === 'TRANSFER_IN' || txType === 'DEMO_FAUCET' || txType === 'DEPOSIT';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                            isNegative
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isNegative ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                          {txType || 'TRANSACTION'}
                        </span>
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-bold text-sm ${
                          isNegative ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isNegative ? '-' : '+'}
                        {formatCurrency(Math.abs(tx.amount), '')}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-300">
                        {formatCurrency(tx.balance_after, '')}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-sans text-xs max-w-[280px] truncate">
                        {tx.description || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400 font-sans text-[11px] whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Simple Pagination */}
        <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Page {page} {total > 0 ? `• Total ${total} entries` : ''}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!hasPrevPage || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!hasNextPage || isLoading}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
