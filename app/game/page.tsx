import Link from 'next/link';
import type { Metadata } from 'next';
import { DualGameProvider } from '@/contexts/DualGameContext';
import { DualGameSimulator } from '@/components/game-simulator/DualGameSimulator';
import { WsComparisonPanel } from '@/components/game-simulator/WsComparisonPanel';

export const metadata: Metadata = {
  title: 'Game Simulator',
  description:
    'Real-time risk-based game comparing NestJS and Python asyncio WebSocket backends using binary MessagePack protocol.',
  keywords: ['Game', 'WebSocket', 'NestJS', 'Python', 'TypeScript', 'Real-time'],
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

      <main className="flex-1 flex flex-col">
        <DualGameProvider>
          <DualGameSimulator />
        </DualGameProvider>

        <div className="border-t border-[var(--border-color)]">
          <WsComparisonPanel />
        </div>
      </main>
    </div>
  );
}
