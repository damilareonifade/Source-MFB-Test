'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGetTransactions } from '@/lib/api';
import SFBText from '@/components/SFBText';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'outflow' | 'inflow'>('all');
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, 20],
    queryFn: () => apiGetTransactions(page, 20),
  });

  const filteredTransactions = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((txn) => {
      if (activeTab === 'outflow' && txn.type !== 'debit') return false;
      if (activeTab === 'inflow' && txn.type !== 'credit') return false;
      if (serviceFilter && txn.service !== serviceFilter) return false;
      if (statusFilter && txn.status !== statusFilter) return false;
      if (searchQuery && !txn.description.toLowerCase().includes(searchQuery.toLowerCase()) && !txn.reference.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [data?.data, activeTab, serviceFilter, statusFilter, searchQuery]);

  return (
    <main>
      <SFBText size="h2" text="Transactions" fontFamily="display" className="mb-6" />
      <TransactionFilters
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setPage(1); }}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => setSearchQuery(search)}
        serviceFilter={serviceFilter}
        onServiceFilter={(v) => { setServiceFilter(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
        dateFrom={dateFrom}
        onDateFrom={setDateFrom}
        dateTo={dateTo}
        onDateTo={setDateTo}
      />
      <TransactionTable
        transactions={filteredTransactions}
        isLoading={isLoading}
        page={page}
        total={filteredTransactions.length}
        limit={20}
        onPageChange={setPage}
      />
    </main>
  );
}
