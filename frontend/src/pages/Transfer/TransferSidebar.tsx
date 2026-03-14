'use client';

import { cn } from '@/lib/utils';
import SFBText from '@/components/SFBText';

type TransferType = 'local-bank' | 'your-wallet' | 'source-mfb-account' | 'bulk-transfer';

interface TransferSidebarProps {
  active: TransferType;
  onChange: (type: TransferType) => void;
}

const items: { key: TransferType; label: string }[] = [
  { key: 'local-bank', label: 'Local Bank' },
  { key: 'your-wallet', label: 'Your Wallet' },
  { key: 'source-mfb-account', label: 'To Source MFB account' },
  { key: 'bulk-transfer', label: 'Bulk Transfer' },
];

export default function TransferSidebar({ active, onChange }: TransferSidebarProps) {
  return (
    <aside className="card rounded-2xl p-2 h-fit">
      {items.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
            active === key
              ? 'bg-accent-100 dark:bg-accent-700/20 text-primary dark:text-accent-300'
              : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-input-bg)] hover:text-[color:var(--color-text)]'
          )}
        >
          {active === key && (
            <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary dark:bg-accent rounded-full" />
          )}
          <span className={active === key ? 'pl-1' : undefined}>{label}</span>
        </button>
      ))}
    </aside>
  );
}
