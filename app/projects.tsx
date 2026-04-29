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
          <div className="flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--canvas)] px-3 py-2.5 transition-all duration-200 focus-within:border-[var(--cyan-primary)] focus-within:shadow-[0_0_0_2px_rgba(61,90,128,0.15)]">
            <svg
              className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]"
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
              className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
            />
          </div>

          {open && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--canvas)] shadow-lg">
              {suggestions.map((tag) => (
                <li key={tag}>
                  <button
                    onClick={() => addTag(tag)}
                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="flex items-center gap-1.5 rounded-md bg-[var(--cyan-primary)] px-2.5 py-1.5 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-white transition-all duration-200 hover:bg-[var(--text-primary)] hover:scale-105"
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
              className="rounded-md px-3 py-1.5 text-xs text-[var(--text-tertiary)] transition-all duration-200 hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Project grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => (
          <a
            key={project.title}
            href={project.href}
            {...(project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group relative flex flex-col gap-3 rounded-md border border-[var(--border-color)] bg-[var(--canvas)] p-6 transition-all duration-300 ease-out hover:border-[var(--text-tertiary)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 ${visible ? "animate-fade-up" : "opacity-0"}`}
            style={visible ? { animationDelay: `${i * 80 + 80}ms` } : undefined}
          >
            <div className="absolute left-0 top-6 h-0.5 w-0 rounded-r-sm bg-[var(--danger-high)] transition-all duration-300 ease-out group-hover:w-6" />
            <h3 className="pl-3 text-base font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--cyan-primary)]">
              {project.title}
            </h3>
            <p className="pl-3 text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              {project.description}
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pl-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-[var(--bg-secondary)] px-2 py-[0.1875rem] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[var(--text-secondary)] transition-colors group-hover:bg-[var(--bg-tertiary)] group-hover:text-[var(--text-primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.external && (
              <span className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </span>
            )}
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
