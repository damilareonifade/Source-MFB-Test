'use client';

import { Eye, Download, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import SFBText from '@/components/SFBText';
import Badge from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function TransactionTable({
  transactions,
  isLoading,
  page,
  total,
  limit,
  onPageChange,
}: TransactionTableProps) {
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="card rounded-2xl overflow-hidden">
        <div className="p-5 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl overflow-hidden">
      {/* Desktop table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-input-bg)]">
              {['Description', 'Service', 'Date', 'Status', 'Amount', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <SFBText size="p" text="No transactions found" color="muted" />
                </td>
              </tr>
            ) : (
              transactions.map((txn, i) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    'border-b border-[color:var(--color-border)] last:border-0',
                    'hover:bg-[color:var(--color-input-bg)] transition-colors'
                  )}
                >
                  {/* Description */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                        txn.type === 'debit' ? 'bg-danger-light' : 'bg-success-light'
                      )}>
                        {txn.type === 'debit'
                          ? <ArrowUpRight size={16} className="text-danger" />
                          : <ArrowDownLeft size={16} className="text-success" />
                        }
                      </div>
                      <span className="text-sm text-[color:var(--color-text)] max-w-[260px]">
                        {txn.description}
                      </span>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-5 py-4">
                    <Badge
                      label={txn.service}
                      variant={txn.service === 'Transfer' ? 'default' : txn.service === 'Deposit' ? 'success' : 'info'}
                    />
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4">
                    <SFBText size="small" text={txn.date} color="muted" className="whitespace-nowrap" />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <SFBText
                      size="small"
                      text={txn.status}
                      color={txn.status === 'Successful' ? 'success' : txn.status === 'Failed' ? 'danger' : 'accent'}
                      className="font-semibold"
                    />
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4">
                    <SFBText
                      size="small"
                      text={`₦ ${txn.amountFormatted}`}
                      fontFamily="display"
                      className="font-semibold whitespace-nowrap"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-input-bg)] transition-colors text-[color:var(--color-text-muted)]">
                        <Eye size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-full border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-input-bg)] transition-colors text-[color:var(--color-text-muted)]">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-input-bg)]">
          <SFBText
            size="small"
            text={`Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
            color="muted"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="w-8 h-8 rounded-lg border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-card)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[color:var(--color-text-muted)]"
            >
              <ChevronLeft size={14} />
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPageChange(idx + 1)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                  page === idx + 1
                    ? 'bg-primary text-white'
                    : 'border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-card)]'
                )}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-card)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[color:var(--color-text-muted)]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
