import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-actionbg text-primary-400',
  success: 'bg-success-light text-success',
  danger: 'bg-danger-light text-danger',
  warning: 'bg-accent-100 text-accent-700',
  info: 'bg-actionbg text-blue-600',
  neutral: 'bg-[color:var(--color-input-bg)] text-[color:var(--color-text-muted)]',
};

export default function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variantMap[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
