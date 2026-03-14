'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiTransfer, apiGetWallet, mockNigerianBanks } from '@/lib/api';
import SFBText from '@/components/SFBText';
import SFBButton from '@/components/SFBButton';
import SFBInput from '@/components/SFBInput';
import SFBSelect from '@/components/SFBSelect';
import { Skeleton } from '@/components/ui/Skeleton';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type PaymentType = 'one-time' | 'recurring';

interface FormState {
  paymentType: PaymentType;
  amount: string;
  bank: string;
  accountNumber: string;
  remark: string;
}

interface FormErrors {
  amount?: string;
  bank?: string;
  accountNumber?: string;
}

const bankOptions = mockNigerianBanks.map((b) => ({ value: b, label: b }));

export default function TransferForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    paymentType: 'one-time',
    amount: '',
    bank: '',
    accountNumber: '',
    remark: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsg, setSuccessMsg] = useState('');

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: apiGetWallet,
  });

  const mutation = useMutation({
    mutationFn: apiTransfer,
    onSuccess: (data) => {
      setSuccessMsg(`Transfer of ₦${form.amount} successful! Ref: ${data.reference}`);
      setForm((prev) => ({ ...prev, amount: '', accountNumber: '', remark: '' }));
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTimeout(() => setSuccessMsg(''), 5000);
    },
    onError: (err: Error) => {
      setErrors({ amount: err.message });
    },
  });

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    else if (wallet && amt * 100 > wallet.balance) errs.amount = 'Insufficient balance';
    if (!form.bank) errs.bank = 'Select a bank';
    if (!form.accountNumber || form.accountNumber.length < 10) errs.accountNumber = 'Enter a valid 10-digit account number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      recipient: form.accountNumber,
      amount: parseFloat(form.amount),
      bank: form.bank,
      remark: form.remark,
    });
  };

  return (
    <div className="card rounded-2xl p-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <SFBText size="h3" text="Single transfer" fontFamily="display" />
        <button className="text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors underline underline-offset-2">
          Beneficiary
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Payment Type */}
        <div>
          <SFBText size="label" text="Payment Type" className="mb-2 block" />
          <div className="flex rounded-xl border border-[color:var(--color-border)] overflow-hidden bg-[color:var(--color-input-bg)] p-0.5 gap-0.5">
            {(['one-time', 'recurring'] as PaymentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, paymentType: type }))}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5',
                  form.paymentType === type
                    ? 'bg-accent text-primary shadow-sm'
                    : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]'
                )}
              >
                {form.paymentType === type && <Check size={14} />}
                {type === 'one-time' ? 'One Time' : 'Recurring'}
              </button>
            ))}
          </div>
        </div>

        {/* Source Wallet */}
        <div>
          <SFBText size="label" text="Source Wallet" className="mb-2 block" />
          {walletLoading ? (
            <Skeleton className="h-10 rounded-xl" />
          ) : (
            <div className="relative flex items-center border border-[color:var(--color-border)] rounded-xl bg-[color:var(--color-input-bg)] overflow-hidden">
              {/* Flag + currency badge */}
              <div className="flex items-center gap-1.5 pl-3 pr-2 border-r border-[color:var(--color-border)] h-full py-2">
                <div className="w-5 h-3.5 flex overflow-hidden rounded-sm flex-shrink-0">
                  <div className="flex-1 bg-[#008751]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#008751]" />
                </div>
                <span className="text-xs font-semibold text-[color:var(--color-text)]">₦</span>
              </div>
              <select className="flex-1 h-10 px-3 bg-transparent text-sm text-[color:var(--color-text)] outline-none cursor-pointer appearance-none">
                <option>default wallet — ₦{wallet?.balanceFormatted}</option>
              </select>
            </div>
          )}
        </div>

        {/* Amount */}
        <SFBInput
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={form.amount}
          onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          error={errors.amount}
          hint={wallet ? `Available: ₦${wallet.balanceFormatted}` : undefined}
        />

        {/* Bank */}
        <SFBSelect
          label="Bank"
          options={bankOptions}
          value={form.bank}
          onChange={(v) => setForm((prev) => ({ ...prev, bank: v }))}
          placeholder="Select destination bank"
          error={errors.bank}
        />

        {/* Account Number */}
        <SFBInput
          label="Account number"
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter destination account number"
          value={form.accountNumber}
          onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
          error={errors.accountNumber}
        />

        {/* Remark */}
        <SFBInput
          label="Remark"
          placeholder="Enter remark"
          value={form.remark}
          onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
        />

        {/* Success / Error feedback */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-success-light text-success rounded-xl text-sm"
            >
              <Check size={16} className="flex-shrink-0" />
              {successMsg}
            </motion.div>
          )}
          {mutation.isError && !errors.amount && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-danger-light text-danger rounded-xl text-sm"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              Transfer failed. Please try again.
            </motion.div>
          )}
        </AnimatePresence>

        <SFBButton
          label={mutation.isPending ? 'Processing…' : 'Send Transfer'}
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={mutation.isPending}
        />
      </form>
    </div>
  );
}
