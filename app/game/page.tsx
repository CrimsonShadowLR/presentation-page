import Link from 'next/link';
import type { Metadata } from 'next';
import { GameProvider } from '@/contexts/GameContext';
import { GameSimulator } from '@/components/game-simulator/GameSimulator';

export const metadata: Metadata = {
  title: 'Game Simulator — Leandro Lazo',
  description:
    'Real-time risk-based game with a NestJS WebSocket backend using binary MessagePack over Socket.io.',
};

export default function GamePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-jetbrains flex flex-col">
      <header className="flex items-center h-12 px-6 border-b border-[var(--border-color)] shrink-0">
        <Link
          href="/"
          className="text-[11px] font-semibold tracking-[2px] text-[var(--text-secondary)] hover:text-[#C53D43] transition-colors"
        >
          ← PORTFOLIO
        </Link>
      </header>

      <main className="flex-1">
        <GameProvider>
          <GameSimulator />
        </GameProvider>
      </main>
    </div>
  );
}
