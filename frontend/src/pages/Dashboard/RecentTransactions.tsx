'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGetTransactions } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import SFBText from '@/components/SFBText';
import Badge from '@/components/ui/Badge';
import { Eye, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RecentTransactions() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 1, 5],
    queryFn: () => apiGetTransactions(1, 5),
  });

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="card rounded-2xl overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <SFBText size="h3" text="Recent Transactions" fontFamily="display" />
        <button
          onClick={() => navigate('/transactions')}
          className="text-sm font-medium text-primary dark:text-primary-200 hover:underline underline-offset-2 transition-colors"
        >
          View all
        </button>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-input-bg)]">
          {['Description', 'Service', 'Date', 'Status', 'Amount', ''].map((h) => (
            <SFBText key={h} size="label" text={h} color="muted" className="text-xs uppercase tracking-wide" />
          ))}
        </div>

        {/* Rows */}
        <div>
          {data?.data.map((txn, i) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'grid grid-cols-[auto_1fr_auto] sm:grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center',
                i < (data?.data.length ?? 0) - 1 && 'border-b border-[color:var(--color-border)]',
                'hover:bg-[color:var(--color-input-bg)] transition-colors'
              )}
            >
              {/* Icon + Description */}
              <div className="flex items-center gap-3 col-span-1 sm:col-span-1 min-w-0">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                  txn.type === 'debit' ? 'bg-danger-light' : 'bg-success-light'
                )}>
                  {txn.type === 'debit'
                    ? <ArrowUpRight size={16} className="text-danger" />
                    : <ArrowDownLeft size={16} className="text-success" />
                  }
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm text-[color:var(--color-text)] truncate">{txn.description}</p>
                </div>
              </div>

              {/* Mobile: Description */}
              <div className="sm:hidden min-w-0">
                <p className="text-sm text-[color:var(--color-text)] truncate">{txn.description}</p>
                <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">{txn.date}</p>
              </div>

              {/* Mobile: Amount */}
              <div className="sm:hidden text-right">
                <p className={cn(
                  'text-sm font-semibold font-display',
                  txn.type === 'debit' ? 'text-danger' : 'text-success'
                )}>
                  {txn.type === 'debit' ? '-' : '+'}₦ {txn.amountFormatted}
                </p>
                <p className={cn(
                  'text-xs mt-0.5',
                  txn.status === 'Successful' ? 'text-success' : txn.status === 'Failed' ? 'text-danger' : 'text-accent-600'
                )}>
                  {txn.status}
                </p>
              </div>

              {/* Service badge */}
              <div className="hidden sm:block">
                <Badge
                  label={txn.service}
                  variant={txn.service === 'Transfer' ? 'default' : txn.service === 'Deposit' ? 'success' : 'info'}
                />
              </div>

              {/* Date */}
              <SFBText size="small" text={txn.date} color="muted" className="hidden sm:block whitespace-nowrap" />

              {/* Status */}
              <SFBText
                size="small"
                text={txn.status}
                color={txn.status === 'Successful' ? 'success' : txn.status === 'Failed' ? 'danger' : 'accent'}
                className="hidden sm:block font-medium"
              />

              {/* Amount */}
              <SFBText
                size="small"
                text={`₦ ${txn.amountFormatted}`}
                fontFamily="display"
                className="hidden sm:block font-semibold whitespace-nowrap"
              />

              {/* Actions */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-input-bg)] transition-colors text-[color:var(--color-text-muted)]">
                  <Eye size={14} />
                </button>
                <button className="p-1.5 rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-input-bg)] transition-colors text-[color:var(--color-text-muted)]">
                  <Download size={14} />
                </button>
              </div>
            </motion.div>
          ))}

          {(!data?.data || data.data.length === 0) && (
            <div className="py-12 flex flex-col items-center gap-2">
              <SFBText size="p" text="No recent transactions" color="muted" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
