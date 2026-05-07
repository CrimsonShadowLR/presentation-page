"use client";

import { useEffect, useState, type ReactNode } from "react";

const allPhrases = [
  "show me the code",
  "simplicity",
  "break the problem down",
  "make it work",
  "refactor without mercy",
  "learn by doing",
  "composition > inheritance",
  "context is everything",
  "never stop learning",
  "empathy",
  "less is more",
  "clean code",
  "git",
  "choose boring technology",
  "security is a process",
  "tests",
  "clear APIs",
  "do things that don't scale",
  "abstraction is the key",
  "the best error explains itself",
  "algorithms are not neutral",
  "AI should augment, not replace",
  "observe your code in production",
  "concurrency != parallelism",
  "accessibility",
  "debugging is twice as hard",
  "your community is your superpower",
  "question everything",
  "commits that tell stories",
  "code never lies",
  "if you can't explain it simply",
  "developer experience",
  "code review to learn",
  "the best request is the one not made",
  "the code that doesn't exist works best",
  "learn the problem, not the framework",
  "CSS is a language",
  "tech debt must be paid",
  "all abstractions leak",
  "convention over configuration",
  "data matters",
  "deploy on friday",
  "make it work, make it right, make it fast",
  "one function, one thing",
  "write tests that fail",
  "animations with purpose",
  "prefer composition",
  "refactor",
  "learn in public",
  "duplicate before abstracting",
  "write code you can delete",
  "explicit > implicit",
  "errors are data",
  "README",
  "the terminal is your superpower",
  "don't optimize without measuring",
  "names reveal intention",
  "state is the root of all evil",
  "every millisecond counts",
  "don't reinvent the wheel",
  "code is communication",
  "good design is easy to change",
  "TypeScript makes you faster",
  "tests are documentation",
  "start from the end",
  "logs are your best friend",
  "dependencies are debt",
  "reproduce the bug first",
  "separate what changes",
  "always monitor",
  "documentation is empathy",
  "no universal best practices",
  "software is a process",
  "document the decisions",
  "learn to say no",
  "automate what you repeat",
  "take care of your mental health",
  "ask why before how",
  "early feedback is gold",
  "humility",
  "make the right path the easy path",
  "pair programming",
];

const SNIPPET_COUNT = 20;
const LAYER_SIZES: [number, number][] = [[20, 28], [13, 18], [14, 20]];
const LAYER_COLORS = [
  "rgba(75,85,99,0.08)",
  "rgba(55,65,81,0.12)",
  "rgba(26,53,80,0.18)",
];
// Drift speed per layer: background slowest, foreground fastest
const LAYER_DURATION: [number, number][] = [[28, 36], [20, 28], [14, 22]];

function pickRandomSnippets() {
  const shuffled = [...allPhrases].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, SNIPPET_COUNT);

  const cols = 5;
  const rows = 4;
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const jitter = 0.4;

  return picked.map((text, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const layer = row === 0 ? 0 : row <= 2 ? 1 : 2;
    const [minSize, maxSize] = LAYER_SIZES[layer];
    const size = minSize + Math.random() * (maxSize - minSize);
    const [minDur, maxDur] = LAYER_DURATION[layer];
    const duration = minDur + Math.random() * (maxDur - minDur);
    const delay = Math.random() * -duration; // negative = start mid-animation

    const y = row * cellH + cellH * (0.5 - jitter + Math.random() * jitter * 2);

    return {
      text,
      layer,
      size: Math.round(size),
      y: Math.max(2, Math.min(90, y)),
      duration: Math.round(duration),
      delay: Math.round(delay),
    };
  });
}

export default function ParallaxBackground({ children }: { children: ReactNode }) {
  const [snippets, setSnippets] = useState<ReturnType<typeof pickRandomSnippets>>([]);

  useEffect(() => {
    setSnippets(pickRandomSnippets());
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {snippets.map((snippet, i) => (
          <div
            key={i}
            className="absolute select-none font-mono font-light animate-drift whitespace-nowrap"
            style={{
              top: `${snippet.y}%`,
              fontSize: `${snippet.size / 16}rem`,
              color: LAYER_COLORS[snippet.layer],
              animationDuration: `${snippet.duration}s`,
              animationDelay: `${snippet.delay}s`,
            }}
          >
            {snippet.text}
          </div>
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
