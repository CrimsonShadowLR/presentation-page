interface BulletListProps {
  items: string[];
  color: 'success' | 'danger';
}

function BulletList({ items, color }: BulletListProps) {
  const dotColor =
    color === 'success' ? 'bg-[var(--success)]' : 'bg-[var(--danger-high)]';
  const textColor =
    color === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger-high)]';

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 items-start">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className={`text-sm leading-relaxed ${textColor}`}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface ComparisonCardProps {
  title: string;
  subtitle: string;
  accentColor: string;
  advantages: string[];
  disadvantages: string[];
}

function ComparisonCard({
  title,
  subtitle,
  accentColor,
  advantages,
  disadvantages,
}: ComparisonCardProps) {
  return (
    <div className="flex-1 flex flex-col gap-5 p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex flex-col gap-1 pb-4 border-b border-[var(--border-color)]">
        <span className="text-base font-bold tracking-[2px]" style={{ color: accentColor }}>
          {title}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[2px] text-[var(--text-secondary)]">
          ADVANTAGES
        </span>
        <BulletList items={advantages} color="success" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[2px] text-[var(--text-secondary)]">
          DISADVANTAGES
        </span>
        <BulletList items={disadvantages} color="danger" />
      </div>
    </div>
  );
}

const nodeAdvantages = [
  'Non-blocking event loop — single thread handles thousands of concurrent connections with near-zero context-switch overhead.',
  'V8 JIT compilation delivers C-adjacent throughput on hot paths (message encode/decode loop).',
  'Native MessagePack (msgpackr) runs in the same process without IPC.',
  'TypeScript + NestJS gives compile-time safety and DI for maintainable production code.',
];

const nodeDisadvantages = [
  'Single-threaded: one CPU-heavy operation blocks all connections unless offloaded to worker threads.',
  'Memory overhead of V8 runtime (~30-50 MB baseline) is higher than a Python asyncio process.',
  'Callback/async debt — complex flow control in nested Promise chains can be hard to reason about.',
  'Cold-start time is longer than a minimal Python script.',
];

const pythonAdvantages = [
  'asyncio + websockets is ~200 lines total — minimal surface area, easy to audit.',
  'Native os.urandom() CSPRNG without bindings — direct kernel call.',
  'GIL is irrelevant for I/O-bound WebSocket workloads — await yields freely between connections.',
  'Deployment simplicity: a single python main.py, no build step, no transpilation.',
];

const pythonDisadvantages = [
  'GIL serializes CPU-bound work — CSPRNG buffer refill blocks other coroutines briefly (mitigated by pre-allocation).',
  'No compile-time type safety — runtime TypeErrors surface only under load unless mypy is enforced.',
  'asyncio exception propagation is subtler — unhandled exceptions in tasks are silently swallowed unless gathered correctly.',
  'msgpack Python binding is slower than Node msgpackr for high-throughput scenarios.',
];

const goAdvantages = [
  'True OS-thread parallelism via goroutines — each connection gets a goroutine with ~2 KB stack, scaling to millions concurrently.',
  'Compiled to native binary: no VM, no GC pause spikes, deterministic sub-millisecond latency.',
  'crypto/rand reads directly from the kernel CSPRNG with a pre-allocated 1024-byte buffer — same design as Node, zero overhead.',
  'Static typing, zero-dependency standard library, and single-binary deployment — no package manager at runtime.',
];

const goDisadvantages = [
  'Goroutine-per-connection model requires careful sync.Mutex discipline — data races are compile-silent and only caught by the race detector.',
  'GC stop-the-world pauses (typically <1 ms) can briefly spike tail latency under heavy write load.',
  'vmihailenco/msgpack encodes int64 fields using the full 8-byte wire format regardless of value, requiring the client to handle BigInt decoding.',
  'More boilerplate than Python for equivalent functionality — explicit error returns on every call path.',
];

const comparisonRows = [
  { aspect: 'Concurrency model', node: 'Event loop, libuv', python: 'Event loop, asyncio', go: 'Goroutines, OS threads' },
  { aspect: 'Serialization', node: 'msgpackr (C++ binding)', python: 'msgpack-python (C extension)', go: 'vmihailenco/msgpack (pure Go)' },
  { aspect: 'Session storage', node: 'Map<socketId, State>', python: 'dict[ws_obj, State]', go: 'map[*Conn]*GameState + RWMutex' },
  { aspect: 'Random source', node: 'crypto.randomFillSync', python: 'os.urandom()', go: 'crypto/rand (1 KB buffer)' },
  { aspect: 'Binary frames', node: 'Native Buffer', python: 'bytes', go: '[]byte' },
  { aspect: 'Latency (typical localhost)', node: '0.5-3ms', python: '1-5ms', go: '0.3-2ms' },
];

export function WsComparisonPanel() {
  return (
    <section className="font-jetbrains flex flex-col gap-6 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
      {/* Section header */}
      <div className="flex flex-col gap-1 pb-5 border-b border-[var(--border-color)]">
        <span className="text-xl font-bold tracking-[2px] text-[var(--text-primary)]">
          BACKEND COMPARISON
        </span>
        <span className="text-sm text-[var(--text-secondary)]">
          Node.js/NestJS vs Python asyncio vs Go gorilla/websocket — architectural trade-offs
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-4">
        <ComparisonCard
          title="NODE.JS / NESTJS"
          subtitle="NestJS 11 + Socket.io + msgpackr"
          accentColor="#3D5A80"
          advantages={nodeAdvantages}
          disadvantages={nodeDisadvantages}
        />
        <ComparisonCard
          title="PYTHON / ASYNCIO"
          subtitle="asyncio + websockets + msgpack"
          accentColor="#4B8B3B"
          advantages={pythonAdvantages}
          disadvantages={pythonDisadvantages}
        />
        <ComparisonCard
          title="GO / GORILLA"
          subtitle="gorilla/websocket + vmihailenco/msgpack"
          accentColor="#00ADD8"
          advantages={goAdvantages}
          disadvantages={goDisadvantages}
        />
      </div>

      {/* Notable differences table */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold tracking-[2px] text-[var(--text-secondary)]">
          NOTABLE DIFFERENCES
        </span>
        <div className="rounded-xl border border-[var(--border-color)] overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px] text-[var(--text-muted)]">
                  ASPECT
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px]" style={{ color: '#3D5A80' }}>
                  NODE.JS / NESTJS
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px]" style={{ color: '#4B8B3B' }}>
                  PYTHON ASYNCIO
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px]" style={{ color: '#00ADD8' }}>
                  GO / GORILLA
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]"
                >
                  <td className="px-5 py-3 font-semibold text-[var(--text-secondary)] text-xs whitespace-nowrap">
                    {row.aspect}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-primary)] text-xs font-jetbrains">
                    {row.node}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-primary)] text-xs font-jetbrains">
                    {row.python}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-primary)] text-xs font-jetbrains">
                    {row.go}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
