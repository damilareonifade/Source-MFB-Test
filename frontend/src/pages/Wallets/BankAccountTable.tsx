'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';
import SFBText from '@/components/SFBText';
import SFBButton from '@/components/SFBButton';
import { mockBankAccounts } from '@/lib/api';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

async function fetchBankAccounts() {
  await new Promise((r) => setTimeout(r, 700));
  return mockBankAccounts;
}

export default function BankAccountTable() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: fetchBankAccounts,
  });

  return (
    <div className="card rounded-2xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border)]">
        <SFBText size="h4" text="Bank Account" fontFamily="display" />
        <SFBButton
          label="New bank account"
          variant="outline"
          size="sm"
          icon={<Plus size={14} />}
        />
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-[color:var(--color-input-bg)] border-b border-[color:var(--color-border)]">
            {['Bank Name', 'Account Name', 'Account Number'].map((h) => (
              <SFBText key={h} size="label" text={h} color="accent" className="text-xs uppercase tracking-wide" />
            ))}
          </div>

          {accounts?.map((acc, i) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-3 gap-4 px-5 py-4 border-b border-[color:var(--color-border)] last:border-0 hover:bg-[color:var(--color-input-bg)] transition-colors"
            >
              <SFBText size="p" text={acc.bankName} className="font-medium text-sm" />
              <SFBText size="p" text={acc.accountName} className="font-bold text-sm" />
              <SFBText size="p" text={acc.accountNumber} color="muted" fontFamily="display" className="text-sm tracking-wide" />
            </motion.div>
          ))}

          {accounts?.length === 0 && (
            <div className="py-10 text-center">
              <SFBText size="p" text="No bank accounts linked" color="muted" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
