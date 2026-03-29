'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import {
  getWebSocketService,
  RoundResultResponse,
  HistoryResponse,
  StateUpdateResponse,
  ErrorResponse,
  GameStats as BackendGameStats,
  GameRound as BackendGameRound,
  RiskLevel as BackendRiskLevel,
} from '@/lib/websocket-service';
import { RiskLevel } from '@/types/game';

// Frontend game state types
export interface GameStats {
  wins: number;
  losses: number;
  netPnL: number; // in cents
  winRate: number; // 0-1
  totalRounds: number;
  totalWagered: number;
  totalPayout: number;
}

export interface GameRound {
  roundId: number;
  timestamp: number;
  riskLevel: RiskLevel;
  betAmount: number; // in cents
  isWin: boolean;
  multiplier: number;
  payout: number; // in cents
  balanceAfter: number; // in cents
  latencyMs: number;
}

export interface GameContextState {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Game state
  balance: number; // in cents
  stats: GameStats;
  history: GameRound[];
  lastRound: GameRound | null;

  // Actions
  playRound: (betAmount: number, riskLevel: RiskLevel) => void;
  resetGame: (initialBalance: number) => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextState | undefined>(undefined);

function convertRiskLevel(backendLevel: BackendRiskLevel): RiskLevel {
  const map: Record<BackendRiskLevel, RiskLevel> = {
    [BackendRiskLevel.LOW]: 'low',
    [BackendRiskLevel.MEDIUM]: 'medium',
    [BackendRiskLevel.HIGH]: 'high',
    [BackendRiskLevel.MAX]: 'max',
  };
  return map[backendLevel];
}

function convertGameRound(backendRound: BackendGameRound): GameRound {
  return {
    roundId: backendRound.roundId,
    timestamp: backendRound.timestamp,
    riskLevel: convertRiskLevel(backendRound.riskLevel),
    betAmount: backendRound.betAmount,
    isWin: backendRound.isWin,
    multiplier: backendRound.multiplier,
    payout: backendRound.payout,
    balanceAfter: backendRound.balanceAfter,
    latencyMs: 0,
  };
}

function convertStats(backendStats: BackendGameStats): GameStats {
  return {
    wins: backendStats.wins,
    losses: backendStats.losses,
    netPnL: backendStats.netPnL,
    winRate: backendStats.winRate,
    totalRounds: backendStats.totalRounds,
    totalWagered: backendStats.totalWagered,
    totalPayout: backendStats.totalPayout,
  };
}

interface PendingRound {
  betAmount: number;
  riskLevel: RiskLevel;
  startTime: number;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(100000); // Default $1000.00 in cents
  const [stats, setStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    netPnL: 0,
    winRate: 0,
    totalRounds: 0,
    totalWagered: 0,
    totalPayout: 0,
  });
  const [history, setHistory] = useState<GameRound[]>([]);
  const [lastRound, setLastRound] = useState<GameRound | null>(null);

  const pendingRoundRef = useRef<PendingRound | null>(null);

  const wsService = getWebSocketService();

  const handleRoundResult = useCallback((data: RoundResultResponse) => {
    const pending = pendingRoundRef.current;
    const riskLevel: RiskLevel = pending ? pending.riskLevel : 'medium';
    const betAmount: number = pending ? pending.betAmount : 0;
    const latencyMs: number = pending ? Date.now() - pending.startTime : 0;
    pendingRoundRef.current = null;

    const round: GameRound = {
      roundId: data.roundId,
      timestamp: data.timestamp,
      riskLevel,
      betAmount,
      isWin: data.isWin,
      multiplier: data.multiplier,
      payout: data.payout,
      balanceAfter: data.balanceAfter,
      latencyMs,
    };

    setBalance(data.balanceAfter);
    setStats(convertStats(data.stats));
    setLastRound(round);
    setHistory((prev) => [round, ...prev].slice(0, 50));
    setIsLoading(false);
  }, []);

  const handleHistory = useCallback((data: HistoryResponse) => {
    const converted = data.rounds.map(convertGameRound);
    setHistory(converted);
  }, []);

  const handleStateUpdate = useCallback((data: StateUpdateResponse) => {
    setBalance(data.balance);
    setStats(convertStats(data.stats));
    setIsLoading(false);
  }, []);

  const handleError = useCallback((data: ErrorResponse) => {
    setError(data.message);
    setIsLoading(false);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setError('Connection lost. Reconnecting...');
    } else {
      setError(null);
    }
  }, []);

  useEffect(() => {
    wsService.setRoundResultHandler(handleRoundResult);
    wsService.setHistoryHandler(handleHistory);
    wsService.setStateUpdateHandler(handleStateUpdate);
    wsService.setErrorHandler(handleError);
    wsService.setConnectionChangeHandler((connected: boolean) => {
      handleConnectionChange(connected);
      if (connected) {
        wsService.resetGame(100000);
      }
    });

    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, [wsService, handleRoundResult, handleHistory, handleStateUpdate, handleError, handleConnectionChange]);

  const playRound = useCallback(
    (betAmount: number, riskLevel: RiskLevel) => {
      if (!isConnected) {
        setError('Not connected to server');
        return;
      }

      if (betAmount <= 0) {
        setError('Bet amount must be greater than 0');
        return;
      }

      if (betAmount > balance) {
        setError('Insufficient balance');
        return;
      }

      pendingRoundRef.current = { betAmount, riskLevel, startTime: Date.now() };

      setIsLoading(true);
      setError(null);

      try {
        wsService.playRound(betAmount, riskLevel);
      } catch (err) {
        console.error('Error playing round:', err);
        pendingRoundRef.current = null;
        setError('Failed to play round');
        setIsLoading(false);
      }
    },
    [isConnected, balance, wsService]
  );

  const resetGame = useCallback(
    (initialBalance: number) => {
      if (!isConnected) {
        setError('Not connected to server');
        return;
      }

      setIsLoading(true);
      setError(null);
      pendingRoundRef.current = null;

      try {
        wsService.resetGame(initialBalance);
        setHistory([]);
        setLastRound(null);
        setStats({
          wins: 0,
          losses: 0,
          netPnL: 0,
          winRate: 0,
          totalRounds: 0,
          totalWagered: 0,
          totalPayout: 0,
        });
      } catch (err) {
        console.error('Error resetting game:', err);
        setError('Failed to reset game');
        setIsLoading(false);
      }
    },
    [isConnected, wsService]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: GameContextState = {
    isConnected,
    isLoading,
    error,
    balance,
    stats,
    history,
    lastRound,
    playRound,
    resetGame,
    clearError,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextState {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
