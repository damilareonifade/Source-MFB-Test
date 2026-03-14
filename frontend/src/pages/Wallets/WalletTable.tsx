'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGetWallet, apiDeposit } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import SFBText from '@/components/SFBText';
import SFBButton from '@/components/SFBButton';
import SFBInput from '@/components/SFBInput';
import { MoreHorizontal, Plus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fundModal, setFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');
  const [fundSuccess, setFundSuccess] = useState('');

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: apiGetWallet,
  });

  const depositMutation = useMutation({
    mutationFn: apiDeposit,
    onSuccess: (data) => {
      setFundSuccess(`₦${fundAmount} deposited successfully!`);
      setFundAmount('');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setTimeout(() => {
        setFundSuccess('');
        setFundModal(false);
      }, 2000);
    },
    onError: () => {
      setFundError('Deposit failed. Please try again.');
    },
  });

  const handleFund = () => {
    const amt = parseFloat(fundAmount);
    if (!fundAmount || isNaN(amt) || amt <= 0) {
      setFundError('Enter a valid amount');
      return;
    }
    setFundError('');
    depositMutation.mutate({ amount: amt });
  };

  if (isLoading) {
    return (
      <div className="card rounded-2xl overflow-hidden mb-6">
        <div className="p-5 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card rounded-2xl overflow-hidden mb-6">
        {/* Table header row */}
        <div className="grid grid-cols-[2fr_1.5fr_2fr_auto] gap-4 px-5 py-3.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-input-bg)]">
          {['Wallet Name', 'Balance', 'Actions', ''].map((h) => (
            <SFBText key={h} size="label" text={h} color="accent" className="text-xs uppercase tracking-wide" />
          ))}
        </div>

        {/* Wallet row */}
        <div className="grid grid-cols-[2fr_1.5fr_2fr_auto] gap-4 px-5 py-5 items-center">
          {/* Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success flex-shrink-0" />
            <SFBText size="p" text={wallet?.walletName ?? 'default'} className="font-medium capitalize" />
          </div>

          {/* Balance */}
          <SFBText
            size="p"
            text={`NGN ${wallet?.balanceFormatted ?? '0.00'}`}
            fontFamily="display"
            className="font-bold"
          />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <SFBButton
              label="Fund"
              variant="outline-success"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setFundModal(true)}
            />
            <SFBButton
              label="Transfer"
              variant="outline-danger"
              size="sm"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              }
              onClick={() => navigate('/transfer')}
            />
          </div>

          {/* More */}
          <button className="p-1.5 rounded-lg hover:bg-[color:var(--color-input-bg)] transition-colors text-[color:var(--color-text-muted)]">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Fund Modal */}
      <AnimatePresence>
        {fundModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => { setFundModal(false); setFundAmount(''); setFundError(''); setFundSuccess(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[color:var(--color-card)] rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <SFBText size="h4" text="Fund Wallet" fontFamily="display" />
                  <button
                    onClick={() => { setFundModal(false); setFundAmount(''); setFundError(''); setFundSuccess(''); }}
                    className="p-1.5 rounded-lg hover:bg-[color:var(--color-input-bg)] transition-colors text-[color:var(--color-text-muted)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                {fundSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6"
                  >
                    <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center">
                      <Check size={28} className="text-success" />
                    </div>
                    <SFBText size="p" text={fundSuccess} color="success" className="text-center font-medium" />
                  </motion.div>
                ) : (
                  <>
                    <SFBInput
                      label="Amount (NGN)"
                      type="number"
                      min="1"
                      placeholder="Enter amount to deposit"
                      value={fundAmount}
                      onChange={(e) => { setFundAmount(e.target.value); setFundError(''); }}
                      error={fundError}
                    />
                    <div className="mt-4 flex gap-3">
                      <SFBButton
                        label="Cancel"
                        variant="outline"
                        fullWidth
                        onClick={() => { setFundModal(false); setFundAmount(''); setFundError(''); }}
                      />
                      <SFBButton
                        label={depositMutation.isPending ? 'Processing…' : 'Fund Wallet'}
                        variant="primary"
                        fullWidth
                        loading={depositMutation.isPending}
                        onClick={handleFund}
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
