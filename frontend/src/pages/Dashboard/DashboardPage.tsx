import AccountOverview from './AccountOverview';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';

export default function DashboardPage() {
  return (
    <main>
      <AccountOverview />
      <QuickActions />
      <RecentTransactions />
    </main>
  );
}
