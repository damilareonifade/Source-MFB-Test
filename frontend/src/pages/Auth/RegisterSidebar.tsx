import SFBText from '@/components/SFBText';

const features = [
  {
    title: 'Open a wallet instantly',
    body: 'Get a dedicated account number and start transacting within seconds of signing up.',
  },
  {
    title: 'Send & receive money',
    body: 'Transfer funds to any bank account or Source MFB wallet with zero friction.',
  },
  {
    title: 'Trusted by thousands',
    body: 'Individuals and businesses across Nigeria rely on Source MFB for everyday banking.',
  },
];

const lightVars = {
  '--color-text': '#0D2137',
  '--color-text-muted': '#64748B',
} as React.CSSProperties;

export default function RegisterSidebar() {
  return (
    <div className="flex flex-col justify-between h-full px-10 py-10" style={lightVars}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold font-display">SF</span>
        </div>
        <span className="font-bold text-base text-[#0D2137] font-display tracking-tight">
          Source MicroFinance Bank
        </span>
      </div>

      {/* Tagline */}
      <div className="mt-10 flex-1">
        <SFBText
          size="h2"
          text="Empowering Africa's microfinance ecosystem"
          color="default"
          className="leading-snug mb-10 max-w-xs"
        />

        <div className="flex flex-col gap-7">
          {features.map((f) => (
            <div key={f.title}>
              <SFBText size="h5" text={f.title} color="default" className="mb-1" />
              <SFBText size="p" text={f.body} color="muted" className="text-sm leading-relaxed max-w-xs" />
            </div>
          ))}
        </div>
      </div>

      <SFBText
        size="small"
        text="© 2026 Source MicroFinance Bank. All rights reserved."
        color="muted"
        className="mt-10"
      />
    </div>
  );
}
