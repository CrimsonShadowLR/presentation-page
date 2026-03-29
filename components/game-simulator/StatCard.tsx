interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'wins' | 'losses' | 'pnl' | 'winrate';
  size?: 'mobile' | 'desktop';
}

export function StatCard({ label, value, variant = 'wins', size = 'desktop' }: StatCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'wins':
        return 'text-[var(--success)]';
      case 'pnl':
        return String(value).startsWith('-') ? 'text-[var(--danger-high)]' : 'text-[var(--success)]';
      case 'losses':
        return 'text-[var(--danger-high)]';
      case 'winrate':
        return 'text-[var(--cyan-primary)]';
      default:
        return 'text-[var(--cyan-primary)]';
    }
  };

  const isDesktop = size === 'desktop';

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        ${isDesktop ? 'h-20 rounded-xl bg-[var(--bg-secondary)] gap-1' : 'gap-0.5'}
        w-full
      `}
    >
      <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-secondary)]">
        {label}
      </span>
      <span className={`${isDesktop ? 'text-[28px]' : 'text-xl'} font-bold ${getValueColor()}`}>
        {value}
      </span>
    </div>
  );
}
