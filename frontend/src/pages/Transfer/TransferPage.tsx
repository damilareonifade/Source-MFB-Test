import { useState } from 'react';
import SFBText from '@/components/SFBText';
import TransferSidebar from './TransferSidebar';
import TransferForm from './TransferForm';

type TransferType = 'local-bank' | 'your-wallet' | 'source-mfb-account' | 'bulk-transfer';

export default function TransferPage() {
  const [transferType, setTransferType] = useState<TransferType>('local-bank');

  return (
    <main>
      <SFBText size="h2" text="Transfer to" fontFamily="display" className="mb-6" />
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-56 flex-shrink-0">
          <TransferSidebar active={transferType} onChange={setTransferType} />
        </div>
        <TransferForm />
      </div>
    </main>
  );
}
