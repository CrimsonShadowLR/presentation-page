'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  WebSocketService,
  RoundResultResponse,
  StateUpdateResponse,
  ErrorResponse,
  GameStats as BackendGameStats,
} from '@/lib/websocket-service';
import { RiskLevel } from '@/types/game';

export interface GameStats {
  wins: number;
  losses: number;
  netPnL: number;
  winRate: number;
  totalRounds: number;
  totalWagered: number;
  totalPayout: number;
}

export interface BackendState {
  connected: boolean;
  balance: number;
  stats: GameStats;
  lastLatency: number | null;
  latencyHistory: number[];
  lastResult: { isWin: boolean; payout: number; multiplier: number } | null;
  status: 'idle' | 'pending' | 'error';
  errorMessage: string | null;
}

export type BackendId = 'node' | 'python' | 'go';

export interface RoundHistoryEntry {
  roundIndex: number;
  betAmount: number;
  riskLevel: RiskLevel;
  nodeLatency: number | null;
  pythonLatency: number | null;
  goLatency: number | null;
  nodeIsWin: boolean | null;
  pythonIsWin: boolean | null;
  goIsWin: boolean | null;
  pythonWasConnected: boolean;
  goWasConnected: boolean;
}

export interface DualGameContextState {
  node: BackendState;
  python: BackendState;
  go: BackendState;
  roundHistory: RoundHistoryEntry[];
  playRound: (betAmount: number, riskLevel: RiskLevel) => void;
  resetGame: (initialBalance: number) => void;
}

const defaultStats: GameStats = {
  wins: 0,
  losses: 0,
  netPnL: 0,
  winRate: 0,
  totalRounds: 0,
  totalWagered: 0,
  totalPayout: 0,
};

const defaultBackendState: BackendState = {
  connected: false,
  balance: 100000,
  stats: defaultStats,
  lastLatency: null,
  latencyHistory: [],
  lastResult: null,
  status: 'idle',
  errorMessage: null,
};

function convertStats(s: BackendGameStats): GameStats {
  return {
    wins: s.wins,
    losses: s.losses,
    netPnL: s.netPnL,
    winRate: s.winRate,
    totalRounds: s.totalRounds,
    totalWagered: s.totalWagered,
    totalPayout: s.totalPayout,
  };
}

const DualGameContext = createContext<DualGameContextState | undefined>(undefined);

interface PendingRound {
  betAmount: number;
  riskLevel: RiskLevel;
  startTime: number;
}

// Tracks accumulation of results for a single play() call across all backends
interface RoundAccumulator {
  roundIndex: number;
  betAmount: number;
  riskLevel: RiskLevel;
  sentCount: number;
  receivedCount: number;
  nodeLatency: number | null;
  pythonLatency: number | null;
  goLatency: number | null;
  nodeIsWin: boolean | null;
  pythonIsWin: boolean | null;
  goIsWin: boolean | null;
  pythonWasConnected: boolean;
  goWasConnected: boolean;
}

export function DualGameProvider({ children }: { children: ReactNode }) {
  const [nodeState, setNodeState] = useState<BackendState>(defaultBackendState);
  const [pythonState, setPythonState] = useState<BackendState>(defaultBackendState);
  const [goState, setGoState] = useState<BackendState>(defaultBackendState);
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>([]);

  const nodePendingRef = useRef<PendingRound | null>(null);
  const pythonPendingRef = useRef<PendingRound | null>(null);
  const goPendingRef = useRef<PendingRound | null>(null);
  const roundIndexRef = useRef(0);
  const currentAccRef = useRef<RoundAccumulator | null>(null);

  const nodeServiceRef = useRef<WebSocketService>(
    new WebSocketService(
      process.env.NEXT_PUBLIC_WS_NODE_URL || 'ws://localhost:3001'
    )
  );
  const pythonServiceRef = useRef<WebSocketService>(
    new WebSocketService(
      process.env.NEXT_PUBLIC_WS_PYTHON_URL || 'ws://localhost:3002'
    )
  );
  const goServiceRef = useRef<WebSocketService>(
    new WebSocketService(
      process.env.NEXT_PUBLIC_WS_GO_URL || 'ws://localhost:3003'
    )
  );

  const tryFinalizeRound = useCallback((acc: RoundAccumulator) => {
    if (acc.receivedCount < acc.sentCount) return;

    setRoundHistory((prev) =>
      [
        {
          roundIndex: acc.roundIndex,
          betAmount: acc.betAmount,
          riskLevel: acc.riskLevel,
          nodeLatency: acc.nodeLatency,
          pythonLatency: acc.pythonLatency,
          goLatency: acc.goLatency,
          nodeIsWin: acc.nodeIsWin,
          pythonIsWin: acc.pythonIsWin,
          goIsWin: acc.goIsWin,
          pythonWasConnected: acc.pythonWasConnected,
          goWasConnected: acc.goWasConnected,
        } as RoundHistoryEntry,
        ...prev,
      ].slice(0, 20)
    );

    currentAccRef.current = null;
    roundIndexRef.current += 1;
  }, []);

  // Node handlers
  const handleNodeRoundResult = useCallback(
    (data: RoundResultResponse) => {
      const pending = nodePendingRef.current;
      const latency = pending ? performance.now() - pending.startTime : null;
      nodePendingRef.current = null;

      setNodeState((prev) => {
        const newHistory =
          latency !== null
            ? [...prev.latencyHistory, latency].slice(-20)
            : prev.latencyHistory;
        return {
          ...prev,
          balance: data.balanceAfter,
          stats: convertStats(data.stats),
          lastLatency: latency,
          latencyHistory: newHistory,
          lastResult: {
            isWin: data.isWin,
            payout: data.payout,
            multiplier: data.multiplier,
          },
          status: 'idle',
          errorMessage: null,
        };
      });

      const acc = currentAccRef.current;
      if (acc) {
        acc.nodeLatency = latency;
        acc.nodeIsWin = data.isWin;
        acc.receivedCount += 1;
        tryFinalizeRound(acc);
      }
    },
    [tryFinalizeRound]
  );

  const handleNodeStateUpdate = useCallback((data: StateUpdateResponse) => {
    setNodeState((prev) => ({
      ...prev,
      balance: data.balance,
      stats: convertStats(data.stats),
      status: 'idle',
    }));
  }, []);

  const handleNodeError = useCallback((data: ErrorResponse) => {
    nodePendingRef.current = null;
    setNodeState((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: data.message,
    }));
    const acc = currentAccRef.current;
    if (acc && acc.nodeLatency === null && acc.nodeIsWin === null) {
      acc.receivedCount += 1;
      tryFinalizeRound(acc);
    }
  }, [tryFinalizeRound]);

  const handleNodeConnection = useCallback((connected: boolean) => {
    setNodeState((prev) => ({ ...prev, connected }));
    if (connected && nodeServiceRef.current) {
      nodeServiceRef.current.resetGame(100000);
    }
  }, []);

  // Python handlers
  const handlePythonRoundResult = useCallback(
    (data: RoundResultResponse) => {
      const pending = pythonPendingRef.current;
      const latency = pending ? performance.now() - pending.startTime : null;
      pythonPendingRef.current = null;

      setPythonState((prev) => {
        const newHistory =
          latency !== null
            ? [...prev.latencyHistory, latency].slice(-20)
            : prev.latencyHistory;
        return {
          ...prev,
          balance: data.balanceAfter,
          stats: convertStats(data.stats),
          lastLatency: latency,
          latencyHistory: newHistory,
          lastResult: {
            isWin: data.isWin,
            payout: data.payout,
            multiplier: data.multiplier,
          },
          status: 'idle',
          errorMessage: null,
        };
      });

      const acc = currentAccRef.current;
      if (acc) {
        acc.pythonLatency = latency;
        acc.pythonIsWin = data.isWin;
        acc.receivedCount += 1;
        tryFinalizeRound(acc);
      }
    },
    [tryFinalizeRound]
  );

  const handlePythonStateUpdate = useCallback((data: StateUpdateResponse) => {
    setPythonState((prev) => ({
      ...prev,
      balance: data.balance,
      stats: convertStats(data.stats),
      status: 'idle',
    }));
  }, []);

  const handlePythonError = useCallback((data: ErrorResponse) => {
    pythonPendingRef.current = null;
    setPythonState((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: data.message,
    }));
    const acc = currentAccRef.current;
    if (acc && acc.pythonLatency === null && acc.pythonIsWin === null) {
      acc.receivedCount += 1;
      tryFinalizeRound(acc);
    }
  }, [tryFinalizeRound]);

  const handlePythonConnection = useCallback((connected: boolean) => {
    setPythonState((prev) => ({ ...prev, connected }));
    if (connected && pythonServiceRef.current) {
      pythonServiceRef.current.resetGame(100000);
    }
  }, []);

  // Go handlers
  const handleGoRoundResult = useCallback(
    (data: RoundResultResponse) => {
      const pending = goPendingRef.current;
      const latency = pending ? performance.now() - pending.startTime : null;
      goPendingRef.current = null;

      setGoState((prev) => {
        const newHistory =
          latency !== null
            ? [...prev.latencyHistory, latency].slice(-20)
            : prev.latencyHistory;
        return {
          ...prev,
          balance: data.balanceAfter,
          stats: convertStats(data.stats),
          lastLatency: latency,
          latencyHistory: newHistory,
          lastResult: {
            isWin: data.isWin,
            payout: data.payout,
            multiplier: data.multiplier,
          },
          status: 'idle',
          errorMessage: null,
        };
      });

      const acc = currentAccRef.current;
      if (acc) {
        acc.goLatency = latency;
        acc.goIsWin = data.isWin;
        acc.receivedCount += 1;
        tryFinalizeRound(acc);
      }
    },
    [tryFinalizeRound]
  );

  const handleGoStateUpdate = useCallback((data: StateUpdateResponse) => {
    setGoState((prev) => ({
      ...prev,
      balance: data.balance,
      stats: convertStats(data.stats),
      status: 'idle',
    }));
  }, []);

  const handleGoError = useCallback((data: ErrorResponse) => {
    goPendingRef.current = null;
    setGoState((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: data.message,
    }));
    const acc = currentAccRef.current;
    if (acc && acc.goLatency === null && acc.goIsWin === null) {
      acc.receivedCount += 1;
      tryFinalizeRound(acc);
    }
  }, [tryFinalizeRound]);

  const handleGoConnection = useCallback((connected: boolean) => {
    setGoState((prev) => ({ ...prev, connected }));
    if (connected && goServiceRef.current) {
      goServiceRef.current.resetGame(100000);
    }
  }, []);

  useEffect(() => {
    const nodeSvc = nodeServiceRef.current!;
    const pythonSvc = pythonServiceRef.current!;
    const goSvc = goServiceRef.current!;

    nodeSvc.setRoundResultHandler(handleNodeRoundResult);
    nodeSvc.setStateUpdateHandler(handleNodeStateUpdate);
    nodeSvc.setErrorHandler(handleNodeError);
    nodeSvc.setConnectionChangeHandler(handleNodeConnection);
    nodeSvc.connect();

    pythonSvc.setRoundResultHandler(handlePythonRoundResult);
    pythonSvc.setStateUpdateHandler(handlePythonStateUpdate);
    pythonSvc.setErrorHandler(handlePythonError);
    pythonSvc.setConnectionChangeHandler(handlePythonConnection);
    pythonSvc.connect();

    goSvc.setRoundResultHandler(handleGoRoundResult);
    goSvc.setStateUpdateHandler(handleGoStateUpdate);
    goSvc.setErrorHandler(handleGoError);
    goSvc.setConnectionChangeHandler(handleGoConnection);
    goSvc.connect();

    return () => {
      nodeSvc.disconnect();
      pythonSvc.disconnect();
      goSvc.disconnect();
    };
  }, [
    handleNodeRoundResult,
    handleNodeStateUpdate,
    handleNodeError,
    handleNodeConnection,
    handlePythonRoundResult,
    handlePythonStateUpdate,
    handlePythonError,
    handlePythonConnection,
    handleGoRoundResult,
    handleGoStateUpdate,
    handleGoError,
    handleGoConnection,
  ]);

  const playRound = useCallback(
    (betAmount: number, riskLevel: RiskLevel) => {
      const nodeSvc = nodeServiceRef.current!;
      const pythonSvc = pythonServiceRef.current!;
      const goSvc = goServiceRef.current!;

      const nodeConnected = nodeSvc.isConnected();
      const pythonConnected = pythonSvc.isConnected();
      const goConnected = goSvc.isConnected();
      const sentCount =
        (nodeConnected ? 1 : 0) +
        (pythonConnected ? 1 : 0) +
        (goConnected ? 1 : 0);
      if (sentCount === 0) return;

      const acc: RoundAccumulator = {
        roundIndex: roundIndexRef.current,
        betAmount,
        riskLevel,
        sentCount,
        receivedCount: 0,
        nodeLatency: null,
        pythonLatency: null,
        goLatency: null,
        nodeIsWin: null,
        pythonIsWin: null,
        goIsWin: null,
        pythonWasConnected: pythonConnected,
        goWasConnected: goConnected,
      };
      currentAccRef.current = acc;

      const now = performance.now();

      if (nodeConnected) {
        nodePendingRef.current = { betAmount, riskLevel, startTime: now };
        setNodeState((prev) => ({ ...prev, status: 'pending', errorMessage: null }));
        try {
          nodeSvc.playRound(betAmount, riskLevel);
        } catch {
          nodePendingRef.current = null;
          setNodeState((prev) => ({
            ...prev,
            status: 'error',
            errorMessage: 'Failed to send',
          }));
          acc.receivedCount += 1;
          tryFinalizeRound(acc);
        }
      }

      if (pythonConnected) {
        pythonPendingRef.current = { betAmount, riskLevel, startTime: now };
        setPythonState((prev) => ({ ...prev, status: 'pending', errorMessage: null }));
        try {
          pythonSvc.playRound(betAmount, riskLevel);
        } catch {
          pythonPendingRef.current = null;
          setPythonState((prev) => ({
            ...prev,
            status: 'error',
            errorMessage: 'Failed to send',
          }));
          acc.receivedCount += 1;
          tryFinalizeRound(acc);
        }
      }

      if (goConnected) {
        goPendingRef.current = { betAmount, riskLevel, startTime: now };
        setGoState((prev) => ({ ...prev, status: 'pending', errorMessage: null }));
        try {
          goSvc.playRound(betAmount, riskLevel);
        } catch {
          goPendingRef.current = null;
          setGoState((prev) => ({
            ...prev,
            status: 'error',
            errorMessage: 'Failed to send',
          }));
          acc.receivedCount += 1;
          tryFinalizeRound(acc);
        }
      }
    },
    [tryFinalizeRound]
  );

  const resetGame = useCallback(
    (initialBalance: number) => {
      const nodeSvc = nodeServiceRef.current!;
      const pythonSvc = pythonServiceRef.current!;
      const goSvc = goServiceRef.current!;

      nodePendingRef.current = null;
      pythonPendingRef.current = null;
      goPendingRef.current = null;
      currentAccRef.current = null;
      setRoundHistory([]);

      if (nodeSvc.isConnected()) {
        nodeSvc.resetGame(initialBalance);
        setNodeState((prev) => ({
          ...prev,
          stats: defaultStats,
          lastResult: null,
          lastLatency: null,
          latencyHistory: [],
          status: 'idle',
          errorMessage: null,
        }));
      }

      if (pythonSvc.isConnected()) {
        pythonSvc.resetGame(initialBalance);
        setPythonState((prev) => ({
          ...prev,
          stats: defaultStats,
          lastResult: null,
          lastLatency: null,
          latencyHistory: [],
          status: 'idle',
          errorMessage: null,
        }));
      }

      if (goSvc.isConnected()) {
        goSvc.resetGame(initialBalance);
        setGoState((prev) => ({
          ...prev,
          stats: defaultStats,
          lastResult: null,
          lastLatency: null,
          latencyHistory: [],
          status: 'idle',
          errorMessage: null,
        }));
      }
    },
    []
  );

  const contextValue: DualGameContextState = {
    node: nodeState,
    python: pythonState,
    go: goState,
    roundHistory,
    playRound,
    resetGame,
  };

  return (
    <DualGameContext.Provider value={contextValue}>
      {children}
    </DualGameContext.Provider>
  );
}

export function useDualGame(): DualGameContextState {
  const context = useContext(DualGameContext);
  if (!context) {
    throw new Error('useDualGame must be used within DualGameProvider');
  }
  return context;
}
