'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type SFBButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success' | 'outline-danger' | 'outline-success';
type SFBButtonSize = 'sm' | 'md' | 'lg';

interface SFBButtonProps {
  label: string;
  onClick?: () => void;
  variant?: SFBButtonVariant;
  size?: SFBButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const variantMap: Record<SFBButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm',
  accent: 'bg-accent text-primary font-semibold hover:bg-accent-600 active:bg-accent-700 shadow-sm',
  outline: 'border border-[color:var(--color-border)] bg-transparent text-[color:var(--color-text)] hover:bg-[color:var(--color-input-bg)] active:opacity-80',
  ghost: 'bg-transparent text-[color:var(--color-text)] hover:bg-[color:var(--color-input-bg)] active:opacity-80',
  danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  success: 'bg-success text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
  'outline-danger': 'border border-danger text-danger bg-transparent hover:bg-danger-light active:opacity-80',
  'outline-success': 'border border-success text-success bg-transparent hover:bg-success-light active:opacity-80',
};

const sizeMap: Record<SFBButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[0.9375rem] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

export default function SFBButton({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  type = 'button',
  fullWidth = false,
}: SFBButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantMap[variant],
        sizeMap[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />
      ) : (
        iconPosition === 'left' && icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {label}
      {!loading && iconPosition === 'right' && icon && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}
