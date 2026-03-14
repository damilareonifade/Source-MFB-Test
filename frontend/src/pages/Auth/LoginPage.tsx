import LoginForm from './LoginForm';

// Blue geometric background matching the design reference
const GeometricBg = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="geo" x="0" y="0" width="120" height="80" patternUnits="userSpaceOnUse">
        {/* Parallelogram tiles */}
        <polygon points="0,0 80,0 120,80 40,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <polygon points="80,0 160,0 200,80 120,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <polygon points="-40,0 40,0 80,80 0,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo)" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary px-4 py-12">
      <GeometricBg />

      {/* Footer links */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-white/50">
        <span>© Source MicroFinance Bank</span>
        <span>•</span>
        <a href="#" className="hover:text-white/80 transition-colors">Contact Us ↗</a>
        <span>•</span>
        <a href="#" className="hover:text-white/80 transition-colors">Privacy Policy ↗</a>
      </div>

      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
