'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Settings, Play, Wifi, WifiOff } from 'lucide-react';
import { RiskButton } from '@/components/game-simulator/RiskButton';
import { StatCard } from '@/components/game-simulator/StatCard';
import { HistoryRow } from '@/components/game-simulator/HistoryRow';
import { RiskLevel, GameRound as FrontendGameRound } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import {
  formatCurrency,
  formatCurrencyWithSign,
  formatCurrencyInput,
  parseCurrencyInput,
  formatWinRate,
  formatRiskLevel,
} from '@/lib/format-utils';

export function GameSimulator() {
  const {
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
  } = useGame();

  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('medium');
  const [betInput, setBetInput] = useState('100.00');
  const [isEditingHeaderBalance, setIsEditingHeaderBalance] = useState(false);
  const [headerBalanceInput, setHeaderBalanceInput] = useState('');

  const betAmountCents = parseCurrencyInput(betInput) || 0;

  const riskOptions = [
    { level: 'low' as RiskLevel, label: 'LOW', multiplier: '1.5x' },
    { level: 'medium' as RiskLevel, label: 'MED', multiplier: '2x' },
    { level: 'high' as RiskLevel, label: 'HIGH', multiplier: '3x' },
    { level: 'max' as RiskLevel, label: 'MAX', multiplier: '5x' },
  ];

  const gameHistory: FrontendGameRound[] = history.slice(0, 5).map((round, index) => ({
    round: history.length - index,
    risk: formatRiskLevel(round.riskLevel, round.multiplier),
    result: formatCurrencyWithSign(round.payout - round.betAmount),
    isWin: round.isWin,
    latencyMs: round.latencyMs,
  }));

  const handleBetBlur = () => {
    const cents = parseCurrencyInput(betInput);
    setBetInput(formatCurrencyInput(cents > 0 ? cents : 100));
  };

  const handleBetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleHeaderBalanceClick = () => {
    setHeaderBalanceInput(formatCurrencyInput(balance));
    setIsEditingHeaderBalance(true);
  };

  const handleHeaderBalanceBlur = () => {
    const cents = parseCurrencyInput(headerBalanceInput);
    setIsEditingHeaderBalance(false);
    if (cents > 0 && cents !== balance) {
      resetGame(cents);
    }
  };

  const handleHeaderBalanceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setIsEditingHeaderBalance(false);
    }
  };

  const handlePlay = () => {
    if (!isConnected) return;
    playRound(betAmountCents, selectedRisk);
  };

  const canPlay = !isLoading && isConnected && betAmountCents > 0 && balance >= betAmountCents;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canPlay) {
        e.preventDefault();
        playRound(betAmountCents, selectedRisk);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canPlay, isLoading, isConnected, selectedRisk, betAmountCents, playRound]);

  const resultDisplay = lastRound ? (
    <div className="flex flex-col items-center justify-center h-40 md:h-[200px] rounded-2xl bg-[var(--bg-secondary)] gap-2 md:gap-2.5">
      <span className={`text-sm md:text-base font-semibold tracking-[2px] md:tracking-[3px] ${lastRound.isWin ? 'text-[var(--success)]' : 'text-[var(--danger-high)]'}`}>
        {lastRound.isWin ? 'YOU WIN!' : 'YOU LOSE!'}
      </span>
      <span
        className={`text-[40px] md:text-[52px] font-bold ${
          lastRound.isWin ? 'text-[var(--success)]' : 'text-[var(--danger-high)]'
        }`}
      >
        {formatCurrencyWithSign(lastRound.payout - lastRound.betAmount)}
      </span>
      <span className="text-xs md:text-[13px] font-medium text-[var(--text-secondary)]">
        New Balance: {formatCurrency(lastRound.balanceAfter)}
      </span>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-40 md:h-[200px] rounded-2xl bg-[var(--bg-secondary)] gap-2 md:gap-2.5">
      <span className="text-sm md:text-base font-semibold tracking-[2px] md:tracking-[3px] text-[var(--text-secondary)]">
        READY TO PLAY
      </span>
      <span className="text-[40px] md:text-[52px] font-bold text-[var(--text-muted)]">---</span>
      <span className="text-xs md:text-[13px] font-medium text-[var(--text-secondary)]">
        Select risk and press PLAY
      </span>
    </div>
  );

  const errorDisplay = error && (
    <div className="flex items-center justify-center h-12 px-4 rounded-xl bg-[var(--danger-high)] bg-opacity-20 border border-[var(--danger-high)]">
      <span className="text-sm font-medium text-[var(--danger-high)]">{error}</span>
      <button onClick={clearError} className="ml-auto text-[var(--danger-high)]">
        ×
      </button>
    </div>
  );

  const connectionStatus = (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-[var(--success)]" />
          <span className="text-xs text-[var(--success)]">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-[var(--danger-high)]" />
          <span className="text-xs text-[var(--danger-high)]">Disconnected</span>
        </>
      )}
    </div>
  );

  return (
    <div className="font-jetbrains flex justify-center items-start bg-[var(--bg-primary)] rounded-2xl p-4 md:p-8">
      {/* Mobile Layout (< 768px) */}
      <div className="md:hidden w-full max-w-[480px] rounded-2xl bg-[var(--bg-primary)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between h-16 px-6">
          <span className="text-base font-bold tracking-[1px] text-[var(--text-primary)] whitespace-nowrap">
            GAME SIMULATOR
          </span>
          <div className="flex items-center gap-3">
            {connectionStatus}
            <Gamepad2 className="w-6 h-6 text-[var(--cyan-primary)]" strokeWidth={2} />
          </div>
        </div>

        <div className="h-px bg-[var(--bg-secondary)] w-full" />

        <div className="flex flex-col gap-4 p-6">
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
            BET AMOUNT
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[32px] font-bold text-[var(--cyan-primary)]">$</span>
            <div className="flex items-center h-14 px-4 rounded-xl bg-[var(--bg-secondary)] flex-1">
              <input
                className="text-[28px] font-bold text-[var(--text-primary)] bg-transparent border-none outline-none w-full"
                value={betInput}
                onChange={(e) => setBetInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={handleBetBlur}
                onKeyDown={handleBetKeyDown}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-[var(--bg-secondary)] w-full" />

        <div className="flex flex-col gap-4 p-6">
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
            SELECT RISK LEVEL
          </span>
          <div className="flex gap-2">
            {riskOptions.map((option) => (
              <RiskButton
                key={option.level}
                level={option.level}
                label={option.label}
                multiplier={option.multiplier}
                isSelected={selectedRisk === option.level}
                onClick={() => setSelectedRisk(option.level)}
                variant="mobile"
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--bg-secondary)] w-full" />

        <div className="flex flex-col gap-5 p-6">
          {errorDisplay}
          {resultDisplay}

          <button
            className={`flex items-center justify-center gap-2 h-14 rounded-xl ${
              !canPlay
                ? 'bg-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[#C53D43] hover:opacity-90'
            }`}
            onClick={handlePlay}
            disabled={!canPlay}
          >
            <Play
              className={`w-[22px] h-[22px] ${
                !canPlay ? 'text-[var(--bg-primary)]' : 'text-[var(--black)]'
              } fill-current`}
            />
            <span
              className={`text-base font-bold tracking-[2px] ${
                !canPlay ? 'text-[var(--bg-primary)]' : 'text-[var(--black)]'
              }`}
            >
              {isLoading ? 'PLAYING...' : 'PLAY'}
            </span>
          </button>
        </div>

        <div className="h-px bg-[var(--bg-secondary)] w-full" />

        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
              GAME HISTORY
            </span>
            <span className="text-[11px] font-medium text-[var(--cyan-primary)]">
              [{stats.totalRounds} rounds]
            </span>
          </div>

          <div className="flex flex-col gap-0.5 p-1 rounded-xl bg-[var(--bg-secondary)]">
            {gameHistory.length > 0 ? (
              gameHistory.map((round, index) => (
                <HistoryRow key={index} round={round} variant="mobile" />
              ))
            ) : (
              <div className="flex items-center justify-center h-20 text-[var(--text-muted)]">
                No rounds played yet
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-[var(--bg-secondary)] w-full" />

        <div className="flex items-center justify-around h-16 px-6">
          <StatCard label="WINS" value={stats.wins.toString()} variant="wins" size="mobile" />
          <StatCard label="LOSSES" value={stats.losses.toString()} variant="losses" size="mobile" />
          <StatCard
            label="NET P&L"
            value={formatCurrencyWithSign(stats.netPnL).replace('.00', '')}
            variant="pnl"
            size="mobile"
          />
        </div>
      </div>

      {/* Desktop Layout (>= 768px) */}
      <div className="hidden md:flex w-full max-w-[1120px] rounded-[20px] bg-[var(--bg-primary)] overflow-hidden flex-col border border-[var(--border-color)]">
        <div className="flex items-center justify-between h-[72px] px-10">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-7 h-7 text-[var(--cyan-primary)]" strokeWidth={2} />
            <span className="text-xl font-bold tracking-[2px] text-[var(--text-primary)]">
              GAME SIMULATOR
            </span>
          </div>
          <div className="flex items-center gap-6">
            {connectionStatus}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[1px] text-[var(--text-secondary)]">
                BALANCE
              </span>
              {isEditingHeaderBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold text-[var(--cyan-primary)]">$</span>
                  <input
                    className="text-base font-bold text-[var(--cyan-primary)] bg-transparent border-b border-[var(--cyan-primary)] outline-none w-24"
                    value={headerBalanceInput}
                    onChange={(e) => setHeaderBalanceInput(e.target.value)}
                    onBlur={handleHeaderBalanceBlur}
                    onKeyDown={handleHeaderBalanceKeyDown}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  className="text-base font-bold text-[var(--cyan-primary)] text-left hover:opacity-70 cursor-text"
                  onClick={handleHeaderBalanceClick}
                  disabled={isLoading || !isConnected}
                >
                  {formatCurrency(balance)}
                </button>
              )}
            </div>
            <Settings className="w-[22px] h-[22px] text-[var(--text-muted)]" />
          </div>
        </div>

        <div className="h-px bg-[var(--bg-secondary)] w-full" />

        <div className="flex h-[720px]">
          {/* Left Panel */}
          <div className="flex flex-col w-[420px]">
            <div className="flex flex-col gap-4 p-8">
              <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
                BET AMOUNT
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-[var(--cyan-primary)]">$</span>
                <div className="flex items-center h-14 flex-1 px-4 rounded-xl bg-[var(--bg-secondary)]">
                  <input
                    className="text-[28px] font-bold text-[var(--text-primary)] bg-transparent border-none outline-none w-full"
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={handleBetBlur}
                    onKeyDown={handleBetKeyDown}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--bg-secondary)] w-full" />

            <div className="flex flex-col gap-4 p-8">
              <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
                SELECT RISK LEVEL
              </span>
              <div className="flex gap-2">
                {riskOptions.map((option) => (
                  <RiskButton
                    key={option.level}
                    level={option.level}
                    label={option.label}
                    multiplier={option.multiplier}
                    isSelected={selectedRisk === option.level}
                    onClick={() => setSelectedRisk(option.level)}
                    variant="desktop"
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-[var(--bg-secondary)] w-full" />

            <div className="flex flex-col flex-1 justify-center gap-4 p-8">
              <button
                className={`flex items-center justify-center gap-2.5 h-[60px] rounded-[14px] ${
                  !canPlay
                    ? 'bg-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-[var(--cyan-primary)] hover:opacity-90'
                }`}
                onClick={handlePlay}
                disabled={!canPlay}
              >
                <Play
                  className={`w-6 h-6 ${
                    !canPlay ? 'text-[var(--bg-primary)]' : 'text-[var(--black)]'
                  } fill-current`}
                />
                <span
                  className={`text-lg font-bold tracking-[3px] ${
                    !canPlay ? 'text-[var(--bg-primary)]' : 'text-[var(--black)]'
                  }`}
                >
                  {isLoading ? 'PLAYING...' : 'PLAY'}
                </span>
              </button>
              <p className="text-[11px] font-normal text-[var(--text-muted)] text-center">
                {!isConnected
                  ? 'Connecting to server...'
                  : betAmountCents <= 0
                  ? 'Enter a bet amount'
                  : balance < betAmountCents
                  ? 'Insufficient balance'
                  : 'Press SPACE or click to play'}
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-full bg-[var(--bg-secondary)]" />

          {/* Right Panel */}
          <div className="flex flex-col flex-1">
            <div className="flex flex-col gap-5 p-8">
              {errorDisplay}
              {resultDisplay}

              <div className="flex gap-3">
                <StatCard label="WINS" value={stats.wins.toString()} variant="wins" size="desktop" />
                <StatCard label="LOSSES" value={stats.losses.toString()} variant="losses" size="desktop" />
                <StatCard
                  label="NET P&L"
                  value={formatCurrencyWithSign(stats.netPnL).replace('.00', '')}
                  variant="pnl"
                  size="desktop"
                />
                <StatCard label="WIN RATE" value={formatWinRate(stats.winRate)} variant="winrate" size="desktop" />
              </div>
            </div>

            <div className="h-px bg-[var(--bg-secondary)] w-full" />

            <div className="flex flex-col flex-1 gap-3 p-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)]">
                  GAME HISTORY
                </span>
                <span className="text-[11px] font-medium text-[var(--cyan-primary)]">
                  [{stats.totalRounds} rounds]
                </span>
              </div>

              <div className="flex flex-col gap-0.5 p-1 rounded-xl bg-[var(--bg-secondary)] overflow-auto">
                <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                  <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">ROUND</span>
                  <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">RISK</span>
                  <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">RESULT</span>
                  <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)]">LATENCY</span>
                </div>

                {gameHistory.length > 0 ? (
                  gameHistory.map((round, index) => (
                    <HistoryRow
                      key={index}
                      round={round}
                      variant="desktop"
                      roundNumber={round.round}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-40 text-[var(--text-muted)]">
                    No rounds played yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
