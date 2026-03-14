'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiTransfer, apiGetWallet, apiLookupRecipient, mockNigerianBanks } from '@/lib/api';
import type { RecipientInfo, TransferResult } from '@/lib/api';
import SFBText from '@/components/SFBText';
import SFBButton from '@/components/SFBButton';
import SFBInput from '@/components/SFBInput';
import SFBSelect from '@/components/SFBSelect';
import { Skeleton } from '@/components/ui/Skeleton';
import { Check, AlertCircle, X, AlertTriangle, User } from 'lucide-react';
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

interface LastTransfer {
  recipient: string;
  amount: string;
  timestamp: number;
}

const DUPLICATE_WINDOW_MS = 60_000; // 1 minute
const bankOptions = mockNigerianBanks.map((b) => ({ value: b, label: b }));

// ── Modal overlay ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-sm rounded-2xl card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Confirmation modal ────────────────────────────────────────────────────────

interface ConfirmModalProps {
  amount: string;
  recipient: RecipientInfo;
  remark: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function ConfirmModal({ amount, recipient, remark, onConfirm, onCancel, isPending }: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <div className="flex items-center justify-between mb-5">
        <SFBText size="h3" text="Confirm Transfer" fontFamily="display" />
        <button onClick={onCancel} className="p-1 rounded-full hover:opacity-60 transition-opacity">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2.5 border-b border-[color:var(--color-border)]">
          <SFBText size="small" text="Amount" color="muted" />
          <SFBText size="h4" text={`₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`} fontFamily="display" className="font-bold text-primary" />
        </div>
        <div className="flex justify-between items-center py-2.5 border-b border-[color:var(--color-border)]">
          <SFBText size="small" text="Recipient" color="muted" />
          <div className="text-right">
            <SFBText size="small" text={recipient.accountNumber} fontFamily="display" className="font-semibold" />
            <SFBText size="small" text={recipient.email} color="muted" />
          </div>
        </div>
        {remark && (
          <div className="flex justify-between items-center py-2.5 border-b border-[color:var(--color-border)]">
            <SFBText size="small" text="Remark" color="muted" />
            <SFBText size="small" text={remark} />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <SFBButton label="Cancel" variant="outline" size="md" fullWidth onClick={onCancel} />
        <SFBButton
          label={isPending ? 'Sending…' : 'Send Money'}
          variant="primary"
          size="md"
          fullWidth
          loading={isPending}
          onClick={onConfirm}
        />
      </div>
    </Modal>
  );
}

// ── Success modal ─────────────────────────────────────────────────────────────

interface SuccessModalProps {
  result: TransferResult;
  onClose: () => void;
}

function SuccessModal({ result, onClose }: SuccessModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center text-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
        >
          <Check size={32} className="text-white" strokeWidth={3} />
        </motion.div>

        <div>
          <SFBText size="h3" text="Transfer Successful!" fontFamily="display" className="mb-1" />
          <SFBText
            size="small"
            text={`₦${(result.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })} sent to ${result.recipient.email}`}
            color="muted"
          />
        </div>

        <div className="w-full rounded-xl bg-[color:var(--color-input-bg)] p-3 text-left space-y-1.5">
          <div className="flex justify-between">
            <SFBText size="small" text="Reference" color="muted" />
            <SFBText size="small" text={result.reference} className="font-mono text-xs" />
          </div>
          <div className="flex justify-between">
            <SFBText size="small" text="Account" color="muted" />
            <SFBText size="small" text={result.recipient.accountNumber} fontFamily="display" />
          </div>
        </div>

        <SFBButton label="Done" variant="primary" size="md" fullWidth onClick={onClose} />
      </div>
    </Modal>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

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
  const [resolvedRecipient, setResolvedRecipient] = useState<RecipientInfo | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successResult, setSuccessResult] = useState<TransferResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const lastTransferRef = useRef<LastTransfer | null>(null);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: apiGetWallet,
  });

  // ── Debounced account lookup ────────────────────────────────────────────────
  const triggerLookup = useCallback((value: string) => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    setResolvedRecipient(null);
    setLookupError('');

    if (value.length < 10) return;

    setIsLookingUp(true);
    lookupTimerRef.current = setTimeout(async () => {
      try {
        const info = await apiLookupRecipient(value);
        setResolvedRecipient(info);
        setLookupError('');
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404) {
          setLookupError('Account not found');
        } else if (!status) {
          // Network error — backend might not be running
          setLookupError('Cannot reach server. Is the backend running?');
        } else {
          setLookupError((err as Error).message ?? 'Lookup failed');
        }
      } finally {
        setIsLookingUp(false);
      }
    }, 600);
  }, []);

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, accountNumber: val }));
    triggerLookup(val);
  };

  // ── Duplicate detection ─────────────────────────────────────────────────────
  const checkDuplicate = (recipient: string, amount: string): boolean => {
    const last = lastTransferRef.current;
    if (!last) return false;
    const isRecent = Date.now() - last.timestamp < DUPLICATE_WINDOW_MS;
    return isRecent && last.recipient === recipient && last.amount === amount;
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    else if (wallet && amt * 100 > wallet.balance) errs.amount = 'Insufficient balance';
    if (!form.bank) errs.bank = 'Select a bank';
    if (!form.accountNumber || form.accountNumber.length < 10) errs.accountNumber = 'Enter a valid 10-digit account number';
    else if (lookupError) errs.accountNumber = lookupError;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: apiTransfer,
    onSuccess: (data) => {
      lastTransferRef.current = {
        recipient: form.accountNumber,
        amount: form.amount,
        timestamp: Date.now(),
      };
      setShowConfirm(false);
      setSuccessResult(data);
      setForm((prev) => ({ ...prev, amount: '', accountNumber: '', remark: '' }));
      setResolvedRecipient(null);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err: Error) => {
      setShowConfirm(false);
      setErrors({ amount: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (checkDuplicate(form.accountNumber, form.amount)) {
      setDuplicateWarning(
        `You sent ₦${form.amount} to this account less than a minute ago. Are you sure you want to send again?`
      );
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = () => {
    mutation.mutate({
      recipient: form.accountNumber,
      amount: parseFloat(form.amount),
      bank: form.bank,
      remark: form.remark,
    });
  };

  return (
    <>
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

          {/* Account Number + live lookup */}
          <div>
            <SFBInput
              label="Account number"
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter destination account number"
              value={form.accountNumber}
              onChange={handleAccountNumberChange}
              error={errors.accountNumber}
            />

            <AnimatePresence>
              {isLookingUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]"
                >
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verifying account…
                </motion.div>
              )}
              {!isLookingUp && resolvedRecipient && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-success-light text-success text-sm"
                >
                  <User size={14} className="flex-shrink-0" />
                  <span className="font-medium">{resolvedRecipient.email}</span>
                </motion.div>
              )}
              {!isLookingUp && lookupError && form.accountNumber.length === 10 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-danger-light text-danger text-sm"
                >
                  <AlertCircle size={14} className="flex-shrink-0" />
                  Account not found
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Remark */}
          <SFBInput
            label="Remark"
            placeholder="Enter remark"
            value={form.remark}
            onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
          />

          {/* Duplicate warning */}
          <AnimatePresence>
            {duplicateWarning && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 bg-warning-light text-warning rounded-xl text-sm"
              >
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Possible duplicate transfer</p>
                  <p className="text-xs opacity-90">{duplicateWarning}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => { setDuplicateWarning(''); setShowConfirm(true); }}
                      className="text-xs font-semibold underline underline-offset-2"
                    >
                      Yes, send anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateWarning('')}
                      className="text-xs opacity-70 underline underline-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SFBButton
            label="Send Transfer"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={mutation.isPending}
          />
        </form>
      </div>

      {/* Confirmation modal */}
      {showConfirm && resolvedRecipient && (
        <ConfirmModal
          amount={form.amount}
          recipient={resolvedRecipient}
          remark={form.remark}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          isPending={mutation.isPending}
        />
      )}

      {/* Success modal */}
      {successResult && (
        <SuccessModal
          result={successResult}
          onClose={() => setSuccessResult(null)}
        />
      )}
    </>
  );
}
