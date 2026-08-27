import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/player';
import { AdminTransaction } from '../types/player';
import {
  formatCurrency,
  formatDate,
  formatApiError,
} from '../utils/formatters';
import { Button } from '../components/common/Button';

export const AdminTransactionsPage: React.FC = () => {
  const { player } = useAuth();
  const isAdmin = player?.role?.toUpperCase() === 'ADMIN';

  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdminTransactions = useCallback(
    async (targetPage: number) => {
      if (!isAdmin) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await adminApi.listTransactions(targetPage, limit);
        setTransactions(res.data);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err: any) {
        console.error('Failed to fetch admin transactions:', err);
        setErrorMessage(formatApiError(err));
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, limit]
  );

  useEffect(() => {
    if (isAdmin) {
      fetchAdminTransactions(page);
    }
  }, [isAdmin, page, fetchAdminTransactions]);

  const escapeCsvCell = (value: any): string => {
    if (value === null || value === undefined) {
      return '""';
    }
    const str = String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const handleExportCsv = () => {
    if (isExporting || transactions.length === 0) return;
    setIsExporting(true);

    try {
      const headers = [
        'Transaction ID',
        'Wallet ID',
        'Player ID',
        'Transaction Type',
        'Amount',
        'Balance Before',
        'Balance After',
        'Description',
        'Created At',
      ];

      const rows = transactions.map((tx) => [
        tx.id,
        tx.wallet_id ?? '',
        (tx as any).player_id ?? '',
        tx.transaction_type || tx.type || '',
        tx.amount ?? 0,
        tx.balance_before !== undefined && tx.balance_before !== null
          ? tx.balance_before
          : '',
        tx.balance_after !== undefined && tx.balance_after !== null
          ? tx.balance_after
          : '',
        tx.description || '',
        tx.created_at || '',
      ]);

      const csvContent = [
        headers.map(escapeCsvCell).join(','),
        ...rows.map((row) => row.map(escapeCsvCell).join(',')),
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `wallet-transactions-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Access Denied View if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
          <ShieldX className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-400">
            You do not have administrator permissions to view the system-wide
            transaction ledger.
          </p>
        </div>
        <Link to="/">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Wallet
          </Button>
        </Link>
      </div>
    );
  }

  const hasNextPage = totalPages
    ? page < totalPages
    : transactions.length === limit;
  const hasPrevPage = page > 1;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Admin: All Transactions
            </h1>
            <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold px-2 py-0.5 rounded uppercase">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5"></p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCsv}
            disabled={isLoading || transactions.length === 0 || isExporting}
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
            title={
              transactions.length === 0
                ? 'No transactions to export'
                : 'Export current page as CSV'
            }
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button
            onClick={() => fetchAdminTransactions(page)}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
            Loading admin transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-1">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>No transactions found in system ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider font-sans">
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Wallet ID</th>
                  <th className="py-3 px-3.5">Type</th>
                  <th className="py-3 px-3.5 text-right">Amount</th>
                  <th className="py-3 px-3.5 text-right">Balance Before</th>
                  <th className="py-3 px-3.5 text-right">Balance After</th>
                  <th className="py-3 px-3.5 font-sans">Description</th>
                  <th className="py-3 px-3.5 text-right font-sans">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {transactions.map((tx) => {
                  const txType = (
                    tx.transaction_type ||
                    tx.type ||
                    ''
                  ).toUpperCase();
                  const isNegative =
                    txType === 'TRANSFER_OUT' || txType === 'WITHDRAWAL';
                  const isPositive =
                    txType === 'TRANSFER_IN' ||
                    txType === 'DEMO_FAUCET' ||
                    txType === 'DEPOSIT';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-3.5 text-slate-300 font-bold">
                        #{tx.id}
                      </td>

                      <td className="py-3 px-3.5 text-slate-400">
                        {tx.wallet_id}
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
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
                          {txType || 'TX'}
                        </span>
                      </td>

                      <td
                        className={`py-3 px-3.5 text-right font-bold ${
                          isNegative ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isNegative ? '-' : '+'}
                        {formatCurrency(Math.abs(tx.amount), '')}
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-400">
                        {tx.balance_before !== undefined
                          ? formatCurrency(tx.balance_before, '')
                          : '—'}
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-200 font-bold">
                        {formatCurrency(tx.balance_after, '')}
                      </td>

                      <td className="py-3 px-3.5 text-slate-300 font-sans text-xs max-w-[200px] truncate">
                        {tx.description || '—'}
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-400 font-sans text-[11px] whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Page {page} {totalPages ? `of ${totalPages}` : ''}{' '}
            {total !== undefined ? `(${total} total)` : ''}
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
