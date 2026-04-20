'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play } from 'lucide-react';
import { RiskLevel } from '@/types/game';
import { useDualGame, BackendState, RoundHistoryEntry } from '@/contexts/DualGameContext';
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/lib/format-utils';

const NODE_COLOR = '#3D5A80';
const PYTHON_COLOR = '#4B8B3B';
const GO_COLOR = '#00ADD8';

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formatLatency(ms: number | null): string {
  if (ms === null) return '---';
  return `${ms.toFixed(1)}ms`;
}

interface BackendColumnProps {
  label: string;
  color: string;
  state: BackendState;
}

function BackendColumn({ label, color, state }: BackendColumnProps) {
  const avgLatency = avg(state.latencyHistory);

  return (
    <div className="flex-1 flex flex-col gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold tracking-[2px]"
            style={{ color }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: state.connected ? '#15803D' : '#C53D43' }}
          />
          <span
            className="text-[10px] font-medium tracking-[1px]"
            style={{ color: state.connected ? '#15803D' : '#C53D43' }}
          >
            {state.connected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)]">
          BALANCE
        </span>
        <span className="text-2xl font-bold" style={{ color }}>
          {formatCurrency(state.balance)}
        </span>
      </div>

      {/* Latency */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)]">
            LAST
          </span>
          <span className="text-sm font-bold text-[var(--text-primary)] font-jetbrains">
            {formatLatency(state.lastLatency)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)]">
            AVG (20)
          </span>
          <span className="text-sm font-bold text-[var(--text-secondary)] font-jetbrains">
            {state.latencyHistory.length > 0 ? `${avgLatency.toFixed(1)}ms avg` : '---'}
          </span>
        </div>
      </div>

      {/* Last result */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)]">
          LAST RESULT
        </span>
        {state.lastResult ? (
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold tracking-[2px]"
              style={{ color: state.lastResult.isWin ? 'var(--success)' : 'var(--danger-high)' }}
            >
              {state.lastResult.isWin ? 'WIN' : 'LOSS'}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: state.lastResult.isWin ? 'var(--success)' : 'var(--danger-high)' }}
            >
              {formatCurrency(state.lastResult.payout)}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {state.lastResult.multiplier}x
            </span>
          </div>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">---</span>
        )}
      </div>

      {/* Error */}
      {state.errorMessage && (
        <span className="text-[10px] text-[var(--danger-high)]">{state.errorMessage}</span>
      )}
    </div>
  );
}

interface RoundHistoryTableProps {
  rounds: RoundHistoryEntry[];
}

function RoundHistoryTable({ rounds }: RoundHistoryTableProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
        ROUND HISTORY
      </span>
      <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-auto max-h-64">
        <table className="w-full text-xs font-jetbrains">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">
                ROUND
              </th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">
                BET
              </th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">
                RISK
              </th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-[1px]"
                  style={{ color: NODE_COLOR }}>
                NODE MS
              </th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-[1px]"
                  style={{ color: PYTHON_COLOR }}>
                PYTHON MS
              </th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold tracking-[1px]"
                  style={{ color: GO_COLOR }}>
                GO MS
              </th>
            </tr>
          </thead>
          <tbody>
            {rounds.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[var(--text-muted)]">
                  No rounds played yet
                </td>
              </tr>
            ) : (
              rounds.map((row) => {
                const nodeMs = row.nodeLatency;
                const pythonMs = row.pythonLatency;
                const goMs = row.goLatency;
                const pythonOffline = !row.pythonWasConnected;
                const goOffline = !row.goWasConnected;

                // Color fastest green, slowest red among available latencies
                const available = [
                  nodeMs !== null ? { id: 'node', ms: nodeMs } : null,
                  pythonMs !== null ? { id: 'python', ms: pythonMs } : null,
                  goMs !== null ? { id: 'go', ms: goMs } : null,
                ].filter(Boolean) as { id: string; ms: number }[];

                let nodeCellColor = 'text-[var(--text-primary)]';
                let pythonCellColor = 'text-[var(--text-primary)]';
                let goCellColor = 'text-[var(--text-primary)]';

                if (available.length >= 2) {
                  const minMs = Math.min(...available.map((x) => x.ms));
                  const maxMs = Math.max(...available.map((x) => x.ms));
                  if (minMs !== maxMs) {
                    available.forEach(({ id, ms }) => {
                      if (ms === minMs) {
                        if (id === 'node') nodeCellColor = 'text-[var(--success)]';
                        if (id === 'python') pythonCellColor = 'text-[var(--success)]';
                        if (id === 'go') goCellColor = 'text-[var(--success)]';
                      } else if (ms === maxMs) {
                        if (id === 'node') nodeCellColor = 'text-[var(--danger-high)]';
                        if (id === 'python') pythonCellColor = 'text-[var(--danger-high)]';
                        if (id === 'go') goCellColor = 'text-[var(--danger-high)]';
                      }
                    });
                  }
                }

                const riskLabels: Record<RiskLevel, string> = {
                  low: 'LOW',
                  medium: 'MED',
                  high: 'HIGH',
                  max: 'MAX',
                };

                return (
                  <tr
                    key={row.roundIndex}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-tertiary)]"
                  >
                    <td className="px-4 py-2 text-[var(--text-secondary)]">
                      #{row.roundIndex + 1}
                    </td>
                    <td className="px-4 py-2 text-[var(--text-primary)]">
                      {formatCurrency(row.betAmount)}
                    </td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">
                      {riskLabels[row.riskLevel]}
                    </td>
                    <td className={`px-4 py-2 text-right font-bold ${nodeCellColor}`}>
                      {nodeMs !== null ? nodeMs.toFixed(1) : '---'}
                    </td>
                    <td className={`px-4 py-2 text-right font-bold ${pythonCellColor}`}>
                      {pythonMs !== null
                        ? pythonMs.toFixed(1)
                        : pythonOffline
                          ? <span className="text-[var(--danger-high)] opacity-60">OFFLINE</span>
                          : '---'}
                    </td>
                    <td className={`px-4 py-2 text-right font-bold ${goCellColor}`}>
                      {goMs !== null
                        ? goMs.toFixed(1)
                        : goOffline
                          ? <span className="text-[var(--danger-high)] opacity-60">OFFLINE</span>
                          : '---'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const riskOptions: { level: RiskLevel; label: string; multiplier: string }[] = [
  { level: 'low', label: 'LOW', multiplier: '1.5x' },
  { level: 'medium', label: 'MED', multiplier: '2x' },
  { level: 'high', label: 'HIGH', multiplier: '3x' },
  { level: 'max', label: 'MAX', multiplier: '5x' },
];

export function DualGameSimulator() {
  const { node, python, go, roundHistory, isSimulating, simulatingRoundsLeft, playRound, playMultiRound, resetGame } = useDualGame();

  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('medium');
  const [betInput, setBetInput] = useState('100.00');

  const betAmountCents = parseCurrencyInput(betInput) || 0;

  const isPending =
    node.status === 'pending' ||
    python.status === 'pending' ||
    go.status === 'pending';

  const anyConnected = node.connected || python.connected || go.connected;

  const connectedBalances = [
    node.connected ? node.balance : null,
    python.connected ? python.balance : null,
    go.connected ? go.balance : null,
  ].filter((b): b is number => b !== null);

  const minBalance = connectedBalances.length > 0
    ? Math.min(...connectedBalances)
    : Infinity;

  const canPlay =
    !isPending &&
    !isSimulating &&
    anyConnected &&
    betAmountCents > 0 &&
    minBalance >= betAmountCents;

  const handlePlay = useCallback(() => {
    if (!canPlay) return;
    playRound(betAmountCents, selectedRisk);
  }, [canPlay, playRound, betAmountCents, selectedRisk]);

  const handleBetBlur = () => {
    const cents = parseCurrencyInput(betInput);
    setBetInput(formatCurrencyInput(cents > 0 ? cents : 100));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canPlay) {
        e.preventDefault();
        handlePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canPlay, handlePlay]);

  const connectedCount = [node.connected, python.connected, go.connected].filter(Boolean).length;

  return (
    <div className="font-jetbrains flex flex-col gap-6 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-[2px] text-[var(--text-primary)]">
            GAME SIMULATOR
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-[2px] text-white bg-[var(--cyan-primary)]">
            TRIPLE BACKEND
          </span>
        </div>
        <button
          onClick={() => resetGame(100000)}
          className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          RESET
        </button>
      </div>

      {/* Backend columns */}
      <div className="flex flex-col md:flex-row gap-4">
        <BackendColumn label="NODE.JS" color={NODE_COLOR} state={node} />
        <BackendColumn label="PYTHON" color={PYTHON_COLOR} state={python} />
        <BackendColumn label="GO" color={GO_COLOR} state={go} />
      </div>

      {/* Bet controls */}
      <div className="flex flex-col gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Bet amount */}
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)]">
              BET AMOUNT
            </span>
            <div className="flex items-center gap-2 h-12 px-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <span className="text-lg font-bold text-[var(--cyan-primary)]">$</span>
              <input
                className="text-lg font-bold text-[var(--text-primary)] bg-transparent border-none outline-none w-full"
                value={betInput}
                onChange={(e) => setBetInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={handleBetBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Risk selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)]">
              RISK LEVEL
            </span>
            <div className="flex gap-2 h-12 items-center">
              {riskOptions.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => setSelectedRisk(opt.level)}
                  className={`flex flex-col items-center justify-center px-3 h-full rounded-xl border text-[10px] font-bold tracking-[1px] transition-colors ${
                    selectedRisk === opt.level
                      ? 'bg-[var(--cyan-primary)] text-white border-[var(--cyan-primary)]'
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--cyan-primary)]'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[9px] opacity-70">{opt.multiplier}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Play buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePlay}
            disabled={!canPlay}
            className={`flex flex-1 items-center justify-center gap-2 h-14 rounded-xl transition-opacity ${
              !canPlay
                ? 'bg-[var(--text-muted)] cursor-not-allowed opacity-40'
                : 'bg-[var(--cyan-primary)] hover:opacity-90'
            }`}
          >
            <Play className="w-5 h-5 fill-current text-white" />
            <span className="text-base font-bold tracking-[3px] text-white">
              {isPending && !isSimulating ? 'PLAYING...' : 'PLAY'}
            </span>
          </button>
          <button
            onClick={() => playMultiRound(10, betAmountCents, selectedRisk)}
            disabled={!canPlay}
            className={`flex items-center justify-center gap-2 h-14 px-6 rounded-xl border transition-all ${
              !canPlay
                ? 'border-[var(--border-color)] cursor-not-allowed opacity-40'
                : 'border-[var(--cyan-primary)] hover:bg-[var(--cyan-primary)] hover:bg-opacity-10'
            } ${isSimulating ? 'border-[var(--cyan-primary)]' : ''}`}
          >
            <span
              className="text-sm font-bold tracking-[2px]"
              style={{ color: isSimulating ? 'var(--cyan-primary)' : 'var(--text-secondary)' }}
            >
              {isSimulating ? `${simulatingRoundsLeft} LEFT` : 'PLAY ×10'}
            </span>
          </button>
        </div>
        <p className="text-[10px] text-center text-[var(--text-muted)]">
          {!anyConnected
            ? 'Connecting to backends...'
            : betAmountCents <= 0
            ? 'Enter a bet amount'
            : minBalance < betAmountCents
            ? 'Insufficient balance on one or more backends'
            : `Press SPACE or click to play ${connectedCount} backend${connectedCount !== 1 ? 's' : ''} simultaneously`}
        </p>
      </div>

      {/* Round history table */}
      <RoundHistoryTable rounds={roundHistory} />
    </div>
  );
}
