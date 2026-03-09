"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const projects = [
  {
    title: "Portfolio Site",
    description:
      "A personal portfolio built with Next.js and Tailwind CSS to showcase projects and skills.",
    tags: ["Next.js", "Tailwind"],
    href: "#",
  },
  {
    title: "Task Manager",
    description:
      "A full-stack task management app with real-time updates and team collaboration features.",
    tags: ["React", "Node.js"],
    href: "#",
  },
  {
    title: "CLI Tool",
    description:
      "A command-line utility for automating repetitive development workflows.",
    tags: ["Rust", "CLI"],
    href: "#",
  },
];

export default function Projects() {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    <section className="px-8 pt-10 pb-16 sm:px-16 lg:px-16">
      <h2 className="text-xs font-medium tracking-[0.5px] text-[#9CA3AF] uppercase">
        Projects
      </h2>

      {/* Search + active filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div ref={wrapperRef} className="relative w-64">
          <div className="flex items-center gap-2 rounded-sm border border-[#E8E6E1] bg-[#F7F6F3] px-3 py-2 focus-within:border-[#D1D5DB]">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
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
              className="w-full bg-transparent text-xs text-[#2D2D2D] placeholder-[#9CA3AF] outline-none"
            />
          </div>

          {open && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-0 w-full rounded-sm border border-[#E8E6E1] bg-white py-1">
              {suggestions.map((tag) => (
                <li key={tag}>
                  <button
                    onClick={() => addTag(tag)}
                    className="w-full px-3.5 py-2 text-left text-xs text-[#6B7280] transition-colors hover:bg-[#F0EFEC] hover:text-[#2D2D2D]"
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
                className="flex items-center gap-1.5 rounded-sm bg-[#2D2D2D] px-2 py-1 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[#F7F6F3] transition-colors hover:bg-[#444]"
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
              className="px-2 py-1 text-[11px] text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Project grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <a
            key={project.title}
            href={project.href}
            className="group flex flex-col gap-3 rounded-sm border border-[#E8E6E1] bg-transparent p-6 transition-colors hover:border-[#D1D5DB]"
          >
            <div className="h-0.5 w-6 rounded-sm bg-[#C53D43]" />
            <h3 className="text-base font-medium text-[#2D2D2D]">
              {project.title}
            </h3>
            <p className="text-[13px] leading-[1.5] text-[#6B7280]">
              {project.description}
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-[#F0EFEC] px-2 py-[0.1875rem] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-[#6B7280]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-sm text-[#9CA3AF]">
          No projects match the selected filters.
        </p>
      )}
    </section>
  );
}
