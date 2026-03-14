'use client';

import { Send, ShoppingBag, Clock } from 'lucide-react';
import SFBText from '@/components/SFBText';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const actions = [
  { label: 'Transfer', icon: Send, to: '/transfer' },
  { label: 'Pay Bills', icon: ShoppingBag, to: '/transfer' },
  { label: 'Payment Schedule', icon: Clock, to: '/transfer' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="mb-8">
      <SFBText size="h3" text="Quick Actions" fontFamily="display" className="mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map(({ label, icon: Icon, to }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(to)}
            className="flex items-center gap-3 px-5 py-5 bg-actionbg dark:bg-primary-700/20 border border-[color:var(--color-border)] rounded-2xl cursor-pointer hover:border-primary/30 hover:bg-actionbg/80 transition-all duration-150 text-left"
          >
            <Icon size={22} className="text-primary dark:text-primary-200 flex-shrink-0" strokeWidth={1.75} />
            <SFBText size="h5" text={label} fontFamily="display" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
