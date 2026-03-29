import { RiskLevel } from '@/types/game';

interface RiskButtonProps {
  level: RiskLevel;
  label: string;
  multiplier: string;
  isSelected: boolean;
  onClick: () => void;
  variant?: 'mobile' | 'desktop';
}

export function RiskButton({
  level,
  label,
  multiplier,
  isSelected,
  onClick,
  variant = 'desktop'
}: RiskButtonProps) {
  const getLabelColor = () => {
    if (isSelected) return 'text-[var(--black)]';

    switch (level) {
      case 'low':
      case 'medium':
        return 'text-[var(--cyan-primary)]';
      case 'high':
        return 'text-[var(--danger-high)]';
      case 'max':
        return 'text-[var(--danger-max)]';
      default:
        return 'text-[var(--cyan-primary)]';
    }
  };

  const getMultiplierColor = () => {
    return isSelected ? 'text-[var(--black)]' : 'text-[var(--text-secondary)]';
  };

  const getBackgroundColor = () => {
    return isSelected ? 'bg-[#2D2D2D]' : 'bg-[var(--bg-secondary)]';
  };

  const getBorderStyle = () => {
    return isSelected ? '' : 'border border-[var(--border-color)]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1
        h-16 w-full rounded-[10px]
        ${getBackgroundColor()}
        ${getBorderStyle()}
        transition-all duration-200
        hover:opacity-90
      `}
    >
      <span className={`text-xs font-bold tracking-[1px] ${getLabelColor()}`}>
        {label}
      </span>
      <span className={`text-[11px] font-medium ${getMultiplierColor()}`}>
        {multiplier}
      </span>
    </button>
  );
}
