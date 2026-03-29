export type RiskLevel = 'low' | 'medium' | 'high' | 'max';

export interface RiskOption {
  level: RiskLevel;
  label: string;
  multiplier: string;
  color: string;
}

export interface GameRound {
  round: number;
  risk: string;
  result: string;
  isWin: boolean;
  latencyMs: number;
}

export interface GameStats {
  wins: number;
  losses: number;
  netPnL: string;
  winRate: string;
}

export interface GameState {
  balance: number;
  selectedRisk: RiskLevel;
  currentResult: {
    amount: string;
    newBalance: string;
    isWin: boolean;
  } | null;
  history: GameRound[];
  stats: GameStats;
}
