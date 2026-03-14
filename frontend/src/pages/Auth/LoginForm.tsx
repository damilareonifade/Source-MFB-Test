import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SFBInput from '@/components/SFBInput';
import SFBButton from '@/components/SFBButton';
import SFBText from '@/components/SFBText';
import { apiLogin } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      login(res.token, res.user);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center"
      style={{
        '--color-text': '#0D2137',
        '--color-text-muted': '#64748B',
        '--color-input-bg': '#F8FAFC',
        '--color-border': '#E2E8F0',
      } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold font-display">SF</span>
        </div>
        <span className="font-bold text-lg text-[#0D2137] font-display tracking-tight leading-none">
          Source MicroFinance Bank
        </span>
      </div>

      <SFBText size="h2" text="Sign in" color='default' className="mb-1 text-center" />
      <SFBText
        size="p"
        text="Sign in to continue to your Dashboard"
        color="muted"
        className="mb-7 text-center text-sm"
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
        >
          <SFBText size="small" text={error} color="danger" />
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <SFBInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <SFBInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <button
            type="button"
            className="self-start text-xs text-primary hover:underline font-medium transition-colors"
          >
            Reset Password ↗
          </button>
        </div>

        <SFBButton
          label="Sign in"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          icon={<ArrowRight size={16} />}
          iconPosition="right"
          className="mt-1"
        />
      </form>

      <div className="mt-6 flex items-center gap-1">
        <SFBText size="small" text="New to Source MFB?" color="muted" />
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-xs text-primary font-semibold hover:underline transition-colors flex items-center gap-0.5"
        >
          Create account <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}
