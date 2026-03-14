'use client';

import { useState } from 'react';
import { Search, Calendar, FileOutput } from 'lucide-react';
import SFBButton from '@/components/SFBButton';
import { cn } from '@/lib/utils';

interface TransactionFiltersProps {
  activeTab: 'all' | 'outflow' | 'inflow';
  onTabChange: (tab: 'all' | 'outflow' | 'inflow') => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  serviceFilter: string;
  onServiceFilter: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  dateFrom: string;
  onDateFrom: (v: string) => void;
  dateTo: string;
  onDateTo: (v: string) => void;
}

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'outflow', label: 'Outflow' },
  { key: 'inflow', label: 'Inflow' },
] as const;

export default function TransactionFilters({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  onSearchSubmit,
  serviceFilter,
  onServiceFilter,
  statusFilter,
  onStatusFilter,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
}: TransactionFiltersProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mb-6">
      {/* Tabs + Search row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[color:var(--color-input-bg)] rounded-xl border border-[color:var(--color-border)] self-start">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                activeTab === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
              placeholder="Search (Name, transaction ID...)"
              className="input-base pl-9 pr-4 h-10 text-sm"
            />
          </div>
          <SFBButton
            label="Search"
            variant="accent"
            size="md"
            onClick={onSearchSubmit}
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="card rounded-xl p-4 flex flex-wrap items-center gap-3">
        {/* Filter by Service */}
        <select
          value={serviceFilter}
          onChange={(e) => onServiceFilter(e.target.value)}
          className="input-base h-9 text-sm w-auto min-w-[160px] pr-8 bg-transparent border-0 shadow-none focus:ring-0"
        >
          <option value="">Filter by Service</option>
          <option value="Transfer">Transfer</option>
          <option value="Deposit">Deposit</option>
          <option value="In-app inflow">In-app inflow</option>
        </select>

        <div className="w-px h-6 bg-[color:var(--color-border)]" />

        {/* Filter by Status */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="input-base h-9 text-sm w-auto min-w-[160px] pr-8 bg-transparent border-0 shadow-none focus:ring-0"
        >
          <option value="">Filter by Status</option>
          <option value="Successful">Successful</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>

        <div className="w-px h-6 bg-[color:var(--color-border)]" />

        {/* Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[color:var(--color-text-muted)] font-medium">From:</span>
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFrom(e.target.value)}
              defaultValue={today}
              className="input-base h-9 text-sm w-[150px] pr-8"
            />
            <Calendar
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none"
            />
          </div>
          <span className="text-sm text-[color:var(--color-text-muted)] font-medium">To:</span>
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateTo(e.target.value)}
              defaultValue={today}
              className="input-base h-9 text-sm w-[150px] pr-8"
            />
            <Calendar
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none"
            />
          </div>
        </div>

        {/* Export */}
        <div className="ml-auto">
          <SFBButton
            label="Export Report"
            variant="primary"
            icon={<FileOutput size={16} />}
            iconPosition="left"
          />
        </div>
      </div>
    </div>
  );
}
