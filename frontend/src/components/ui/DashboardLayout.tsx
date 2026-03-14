'use client';

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, History, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import DashboardHeader from './DashboardHeader';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/wallets', label: 'Wallets', icon: Wallet },
  { to: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
  { to: '/transactions', label: 'Transactions', icon: History },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn(
      'flex flex-col gap-1 p-4',
      !mobile && 'w-56 flex-shrink-0'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-bold font-display">SF</span>
        </div>
        <span className="font-bold text-lg text-[color:var(--color-text)] font-display tracking-tight">
          SFBTest
        </span>
      </div>

      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => mobile && setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-input-bg)] hover:text-[color:var(--color-text)]'
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] flex flex-col">
      {/* Mobile Header */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3 bg-[color:var(--color-card)] border-b border-[color:var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold font-display">SF</span>
          </div>
          <span className="font-bold text-base text-[color:var(--color-text)] font-display">SFBTest</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-input-bg)] transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block border-r border-[color:var(--color-border)] bg-[color:var(--color-card)]">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 h-full w-64 z-40 bg-[color:var(--color-card)] border-r border-[color:var(--color-border)] lg:hidden overflow-y-auto"
              >
                <Sidebar mobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-6 max-w-screen-2xl mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
