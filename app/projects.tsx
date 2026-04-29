"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const projects = [
  {
    title: "Game Simulator",
    description:
      "Real-time risk-based game comparing NestJS, Python asyncio, and Go WebSocket backends. Binary MessagePack protocol, cryptographic RNG, in-memory session state, and live P&L tracking.",
    tags: ["NestJS", "Python", "Go", "Next.js", "WebSocket", "TypeScript", "MessagePack"],
    href: "/game",
    gradient: "from-violet-600 via-indigo-600 to-blue-600",
    gradientHover: "from-violet-500 via-indigo-500 to-blue-500",
    accentColor: "#8B5CF6",
    icon: "🎲",
  },
  {
    title: "Kanji Summary",
    description:
      "JLPT vocabulary and kanji reference covering N5 through N1. Browse curated word lists and kanji per level, with N5 and N4 fully available.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "https://kanjisummary.vercel.app/",
    external: true,
    gradient: "from-red-600 via-rose-600 to-orange-500",
    gradientHover: "from-red-500 via-rose-500 to-orange-400",
    accentColor: "#F43F5E",
    icon: "漢字",
  },
  {
    title: "Nieto Segunda Vuelta",
    description:
      "Real-time electoral tracker for Peru's 2026 presidential race. Polls ONPE's official endpoint every 30 seconds, proxies candidate photos to avoid CORS, and computes live vote gaps and ranking positions.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Playwright"],
    href: "https://nietosegundavuelta.vercel.app/",
    external: true,
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    gradientHover: "from-emerald-500 via-teal-500 to-cyan-500",
    accentColor: "#10B981",
    icon: "📊",
  },
];

function useInView(threshold = 0.1) {
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

  const dominantAccent = useMemo(() => {
    if (activeTags.length === 0) return "#3D5A80";
    const tagCounts: Record<string, number> = {};
    filtered.forEach(p => {
      p.tags.forEach(t => {
        if (activeTags.includes(t)) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    });
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const project = projects.find(p => p.tags.includes(topTag || ""));
    return project?.accentColor || "#3D5A80";
  }, [activeTags, filtered]);

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
          <div 
            className="flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--canvas)] px-3 py-2.5 transition-all duration-200 focus-within:border-[var(--cyan-primary)] focus-within:shadow-[0_0_0_2px_rgba(61,90,128,0.15)]"
            style={{ '--accent': dominantAccent } as React.CSSProperties}
          >
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

      {/* Project grid - horizontal cards */}
      <div className="mt-8 grid gap-6">
        {filtered.map((project, i) => (
          <a
            key={project.title}
            href={project.href}
            {...(project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group relative flex flex-col sm:flex-row rounded-xl bg-[var(--canvas)] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] ${visible ? "animate-fade-up" : "opacity-0"}`}
            style={visible ? { animationDelay: `${i * 100 + 100}ms` } : undefined}
          >
            {/* Gradient accent border - left edge */}
            <div 
              className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
              style={{ background: `linear-gradient(to bottom, ${project.gradientHover.replace(/^from-/, '').split(' ')[0]}, ${project.accentColor})` }}
            />
            {/* Gradient header / sidebar with glassmorphism */}
            <div className={`relative flex h-40 sm:h-auto sm:w-48 shrink-0 ${project.gradient} overflow-hidden backdrop-blur-md transition-all duration-500 ease-out group-hover:${project.gradientHover}`}>
              {/* Dot grid pattern overlay */}
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-4xl font-medium text-white drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110" style={{ WebkitTextStroke: '1px #7c2d12' }}>{project.icon}</span>
                </span>
              </div>
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/10 to-transparent" />
              {/* Animated shine effect */}
              <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
            </div>

            {/* Content */}
            <div className="relative flex flex-1 flex-col gap-3 p-6">
              {/* Left accent bar - dynamic color */}
              <div 
                className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full transition-all duration-300 ease-out group-hover:w-1" 
                style={{ background: `linear-gradient(to bottom, ${project.accentColor}, ${project.accentColor}80)` }}
              />

              <div className="flex items-start justify-between gap-4">
                <h3 className="pl-3 text-xl font-medium text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[var(--text-primary)]" style={{ color: project.accentColor }}>
                  {project.title}
                </h3>
                {project.external && (
                  <span className="shrink-0 opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </span>
                )}
              </div>

              <p className="pl-3 text-[14px] leading-[1.65] text-[var(--text-secondary)]">
                {project.description}
              </p>

              <div className="mt-2 flex flex-wrap gap-2 pl-3">
                {project.tags.map((tag, tagIndex) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[var(--text-secondary)] transition-all duration-300 hover:border-transparent"
                    style={{ 
                      ...(visible ? { animationDelay: `${i * 100 + 100 + tagIndex * 50}ms` } : {}),
                      '--tw-border-opacity': '0.3',
                      borderColor: project.accentColor,
                      backgroundColor: `${project.accentColor}15`,
                      color: project.accentColor
                    } as React.CSSProperties}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow indicator */}
              <div className="absolute right-4 bottom-4 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: project.accentColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] animate-[breathe_2s_ease-in-out_infinite]">
            <svg className="h-8 w-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">No projects match the selected filters.</p>
          <button
            onClick={() => { setActiveTags([]); setQuery(""); }}
            className="text-sm text-[var(--cyan-primary)] transition-colors hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
