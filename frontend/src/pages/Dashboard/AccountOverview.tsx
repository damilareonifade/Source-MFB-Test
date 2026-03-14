'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGetWallet } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import SFBText from '@/components/SFBText';
import { motion } from 'framer-motion';

export default function AccountOverview() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: apiGetWallet,
  });

  const handleCopy = () => {
    if (wallet?.accountNumber) {
      navigator.clipboard.writeText(wallet.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-44" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <SFBText size="h3" text="Account Overview" fontFamily="display" />
        <button
          onClick={() => setVisible(!visible)}
          className="p-1 rounded-full border-2 border-[color:var(--color-text)] hover:opacity-70 transition-opacity"
          aria-label="Toggle balance visibility"
        >
          {visible
            ? <Eye size={14} strokeWidth={2.5} />
            : <EyeOff size={14} strokeWidth={2.5} />
          }
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-primary rounded-2xl p-5 flex flex-col justify-between min-h-[9rem]"
        >
          <SFBText size="small" text="Total Available balance" color="white" className="opacity-80" />
          <div>
            {visible ? (
              <SFBText
                size="h2"
                text={`₦${wallet?.balanceFormatted ?? '0.00'}`}
                color="white"
                fontFamily="display"
                className="text-3xl font-bold"
              />
            ) : (
              <div className="flex gap-1 mt-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/60" />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Default Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card rounded-2xl p-5 flex flex-col justify-between min-h-[9rem] relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Nigerian flag */}
              <div className="w-5 h-4 flex overflow-hidden rounded-sm flex-shrink-0">
                <div className="flex-1 bg-[#008751]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#008751]" />
              </div>
              <SFBText size="small" text="Default Wallet" color="muted" />
            </div>
            <div className="flex flex-col gap-0.5">
              <button className="p-0.5 hover:opacity-60 transition-opacity">
                <ChevronUp size={14} className="text-[color:var(--color-text-muted)]" />
              </button>
              <button className="p-0.5 hover:opacity-60 transition-opacity">
                <ChevronDown size={14} className="text-[color:var(--color-text-muted)]" />
              </button>
            </div>
          </div>

          <div>
            {visible ? (
              <SFBText
                size="h3"
                text={`₦${wallet?.balanceFormatted ?? '0.00'}`}
                fontFamily="display"
                className="font-bold"
              />
            ) : (
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[color:var(--color-border)]" />
                ))}
              </div>
            )}
          </div>

          <button className="text-xs text-accent-600 hover:text-accent-700 underline underline-offset-2 transition-colors self-start font-medium">
            See all
          </button>
        </motion.div>

        {/* New Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="border-2 border-primary rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-actionbg transition-colors min-h-[9rem] bg-actionbg/50 dark:bg-primary-700/20"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <SFBText size="label" text="New Wallet" fontFamily="display" />
        </motion.div>

        {/* Virtual Bank Account Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-accent-100 dark:bg-accent-700/20 rounded-2xl p-5 flex flex-col justify-between min-h-[9rem] relative"
        >
          <div className="flex items-center justify-between">
            <SFBText size="small" text="Virtual Bank Account" color="muted" />
            <div className="flex flex-col gap-0.5">
              <button className="p-0.5 hover:opacity-60 transition-opacity">
                <ChevronUp size={14} className="text-[color:var(--color-text-muted)]" />
              </button>
              <button className="p-0.5 hover:opacity-60 transition-opacity">
                <ChevronDown size={14} className="text-[color:var(--color-text-muted)]" />
              </button>
            </div>
          </div>
          <div>
            <SFBText size="small" text="SourceMFB" color="muted" />
            <div className="flex items-center gap-2 mt-1">
              <SFBText
                size="h4"
                text={wallet?.accountNumber ?? '—'}
                fontFamily="display"
                className="tracking-wide"
              />
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-accent-200 transition-colors text-[color:var(--color-text-muted)]"
                title="Copy account number"
              >
                {copied
                  ? <span className="text-xs text-success font-medium">✓</span>
                  : <Copy size={14} />
                }
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
