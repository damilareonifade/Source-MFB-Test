import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SFBInput from '@/components/SFBInput';
import SFBButton from '@/components/SFBButton';
import SFBText from '@/components/SFBText';
import { apiRegister } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function RegisterForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the Terms of Use to continue');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiRegister({ email, password });
      console.log(res," This is the response");
      
      login(res.token, res.user);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [email, password, agreed, login, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-[540px] px-10 py-10 flex flex-col justify-center"
      style={{
        '--color-text': '#0D2137',
        '--color-text-muted': '#64748B',
        '--color-input-bg': '#F8FAFC',
        '--color-border': '#E2E8F0',
      } as React.CSSProperties}
    >
      <SFBText
        size="h2"
        text="Create your Source MFB account"
        color="default"
        className="mb-8"
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
        >
          <SFBText size="small" text={error} color="danger" />
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name row */}

        <SFBInput
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <SFBInput
          label="Choose a password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          hint="At least 6 characters"
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

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group mt-1">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[color:var(--color-border)] accent-primary flex-shrink-0 cursor-pointer"
          />
          <span className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
            I agree to Source MFB's{' '}
            <a href="#" className="text-primary font-medium hover:underline">Terms of Use</a>
            {' '}and{' '}
            <a href="#" className="text-primary font-medium hover:underline">Privacy Policy</a>
          </span>
        </label>

        <SFBButton
          label="Create my account"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          icon={<ArrowRight size={16} />}
          iconPosition="right"
          className="mt-2"
        />
      </form>

      <div className="mt-6 flex items-center gap-1">
        <SFBText size="small" text="Already have an account?" color="muted" />
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-xs text-primary font-semibold hover:underline transition-colors flex items-center gap-0.5"
        >
          Sign in <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}
