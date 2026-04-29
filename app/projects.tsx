"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const projects = [
  {
    title: "Game Simulator",
    description:
      "Real-time risk-based game comparing NestJS, Python asyncio, and Go WebSocket backends. Binary MessagePack protocol, cryptographic RNG, in-memory session state, and live P&L tracking.",
    tags: ["NestJS", "Python", "Go", "Next.js", "WebSocket", "TypeScript", "MessagePack"],
    href: "/game",
  },
  {
    title: "Kanji Summary",
    description:
      "JLPT vocabulary and kanji reference covering N5 through N1. Browse curated word lists and kanji per level, with N5 and N4 fully available.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "https://kanjisummary.vercel.app/",
    external: true,
  },
  {
    title: "Nieto Segunda Vuelta",
    description:
      "Real-time electoral tracker for Peru's 2026 presidential race. Polls ONPE's official endpoint every 30 seconds, proxies candidate photos to avoid CORS, and computes live vote gaps and ranking positions.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Playwright"],
    href: "https://nietosegundavuelta.vercel.app/",
    external: true,
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function Projects() {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, visible } = useInView();

  const allTags = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tags))],
    [],
  );

  const suggestions = useMemo(
    () =>
      allTags.filter(
        (tag) =>
          !activeTags.includes(tag) &&
          tag.toLowerCase().includes(query.toLowerCase()),
      ),
    [allTags, activeTags, query],
  );

  const filtered =
    activeTags.length > 0
      ? projects.filter((p) => activeTags.some((t) => p.tags.includes(t)))
      : projects;

  function addTag(tag: string) {
    setActiveTags((prev) => [...prev, tag]);
    setQuery("");
    setOpen(false);
  }

  function removeTag(tag: string) {
    setActiveTags((prev) => prev.filter((t) => t !== tag));
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="px-8 pt-10 pb-16 sm:px-16 lg:px-16"
    >
      <h2
        className={`text-xs font-medium tracking-[0.5px] text-[var(--text-tertiary)] uppercase ${visible ? "animate-fade-up" : "opacity-0"}`}
      >
        Projects
      </h2>

      {/* Search + active filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div ref={wrapperRef} className="relative w-64">
          <div className="flex items-center gap-2 rounded-sm border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 focus-within:border-[#D1D5DB]">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Filter by tech..."
              className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
            />
          </div>

          {open && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-0 w-full rounded-sm border border-[var(--border-color)] bg-[var(--canvas)] py-1">
              {suggestions.map((tag) => (
                <li key={tag}>
                  <button
                    onClick={() => addTag(tag)}
                    className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="flex items-center gap-1.5 rounded-sm bg-[var(--text-primary)] px-2 py-1 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[var(--bg-primary)] transition-colors hover:opacity-80"
              >
                {tag}
                <svg
                  className="h-2.5 w-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
            <button
              onClick={() => setActiveTags([])}
              className="px-2 py-1 text-[11px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Project grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => (
          <a
            key={project.title}
            href={project.href}
            {...(project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group flex flex-col gap-3 rounded-sm border border-[var(--border-color)] bg-transparent p-6 transition-colors hover:border-[var(--text-tertiary)] ${visible ? "animate-fade-up" : "opacity-0"}`}
            style={visible ? { animationDelay: `${i * 80 + 80}ms` } : undefined}
          >
            <div className="h-0.5 w-6 rounded-sm bg-[var(--danger-high)]" />
            <h3 className="text-base font-medium text-[var(--text-primary)]">
              {project.title}
            </h3>
            <p className="text-[13px] leading-[1.5] text-[var(--text-secondary)]">
              {project.description}
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-[var(--bg-secondary)] px-2 py-[0.1875rem] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-sm text-[var(--text-tertiary)]">
          No projects match the selected filters.
        </p>
      )}
    </section>
  );
}
