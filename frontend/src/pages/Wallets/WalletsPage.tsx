'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGetWallet } from '@/lib/api';
import SFBText from '@/components/SFBText';
import SFBButton from '@/components/SFBButton';
import { Skeleton } from '@/components/ui/Skeleton';
import WalletTable from './WalletTable';
import BankAccountTable from './BankAccountTable';
import { Plus } from 'lucide-react';

export default function WalletsPage() {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: apiGetWallet,
  });

  return (
    <main>
      <SFBText size="h2" text="Wallets" fontFamily="display" className="mb-6" />

      {/* Total balance header */}
      <div className="card rounded-2xl px-5 py-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SFBText size="p" text="NGN Total balance" color="muted" />
          {isLoading ? (
            <Skeleton className="h-7 w-36" />
          ) : (
            <SFBText
              size="h3"
              text={`NGN ${wallet?.balanceFormatted ?? '0.00'}`}
              fontFamily="display"
              className="font-bold"
            />
          )}
        </div>
        <SFBButton
          label="New wallet"
          variant="outline"
          icon={<Plus size={16} />}
        />
      </div>

      {/* Wallets table */}
      <WalletTable />

      {/* Bank accounts table */}
      <BankAccountTable />
    </main>
  );
}
