'use client';

import { Sun, Moon, ChevronDown, Bell, LogOut } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardHeader() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'SB';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-card)] border-b border-[color:var(--color-border)] px-6 py-3">
      <div className="flex items-center justify-end gap-4 max-w-screen-2xl mx-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-input-bg)] transition-colors"
          aria-label="Toggle theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.div>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-input-bg)] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-danger flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold font-display">{initials}</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-[color:var(--color-text)] leading-tight">
              {user?.email ?? 'Guest'}
            </span>
            <span className="text-xs text-[color:var(--color-text-muted)]">
              {user?.accountNumber ? `Acct: ${user.accountNumber}` : ''}
            </span>
          </div>
          <ChevronDown
            size={16}
            className="text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text)] transition-colors"
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-input-bg)] hover:text-danger transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
