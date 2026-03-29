import { GameRound } from '@/types/game';

interface HistoryRowProps {
  round: GameRound;
  variant?: 'mobile' | 'desktop';
  roundNumber?: number;
}

export function HistoryRow({ round, variant = 'desktop', roundNumber }: HistoryRowProps) {
  const isWin = round.isWin;
  const resultColor = isWin ? 'text-[var(--success)]' : 'text-[var(--danger-high)]';

  const getRiskColor = (riskText: string) => {
    if (riskText.includes('LOW') || riskText.includes('MED')) {
      return 'text-[var(--cyan-primary)]';
    } else if (riskText.includes('HIGH')) {
      return 'text-[var(--danger-high)]';
    } else if (riskText.includes('MAX')) {
      return 'text-[var(--danger-max)]';
    }
    return 'text-[var(--cyan-primary)]';
  };

  if (variant === 'mobile') {
    return (
      <div className="flex items-center justify-between h-12 px-4 rounded-lg bg-[var(--bg-tertiary)]">
        <span className={`text-xs font-semibold ${getRiskColor(round.risk)}`}>
          {round.risk}
        </span>
        <span className={`text-sm font-bold ${resultColor}`}>
          {round.result}
        </span>
        <span className="text-[10px] font-medium text-[var(--text-muted)]">
          {round.latencyMs}ms
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-11 px-4 rounded-lg bg-[var(--bg-tertiary)]">
      <span className="text-[13px] font-medium text-[var(--text-tertiary)]">
        #{roundNumber}
      </span>
      <span className={`text-[13px] font-semibold ${getRiskColor(round.risk)}`}>
        {round.risk}
      </span>
      <span className={`text-[13px] font-bold ${resultColor}`}>
        {round.result}
      </span>
      <span className="text-[12px] font-medium text-[var(--text-muted)]">
        {round.latencyMs}ms
      </span>
    </div>
  );
}
