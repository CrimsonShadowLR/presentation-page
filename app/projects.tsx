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

  // Close suggestions on outside click
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
    <section className="px-8 pt-10 pb-20 sm:px-16 lg:px-[7.5rem]">
      <h2 className="text-[1rem] font-medium tracking-[0.125rem] text-[#6D6C6A] uppercase">
        Projects
      </h2>

      {/* Search + active filters */}
      <div className="mt-8 flex flex-wrap items-start gap-3">
        {/* Search input */}
        <div ref={wrapperRef} className="relative w-64">
          <div className="flex items-center gap-2 border border-[#E5E0D8] bg-white px-3 py-2 focus-within:border-[#D1D0CD]">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-[#9C9B99]"
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
              className="w-full bg-transparent text-sm text-[#1A1918] placeholder-[#B5B4B2] outline-none"
            />
          </div>

          {/* Suggestions dropdown */}
          {open && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-0 w-full border border-[#E5E0D8] bg-white py-1">
              {suggestions.map((tag) => (
                <li key={tag}>
                  <button
                    onClick={() => addTag(tag)}
                    className="w-full px-3.5 py-2 text-left text-sm text-[#6D6C6A] transition-colors hover:bg-[#F5F0E8] hover:text-[#1A1918]"
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active filter pills */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="flex items-center gap-1.5 bg-[#1A1918] px-3 py-1.5 text-sm text-[#F5F0E8] transition-colors hover:bg-[#333]"
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
              className="px-2 py-1.5 text-sm text-[#B5B4B2] transition-colors hover:text-[#6D6C6A]"
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
            className="group flex flex-col gap-3 border border-[#E5E0D8] bg-white p-6 transition-colors hover:border-[#D1D0CD]"
          >
            <h3 className="text-[1.375rem] font-medium text-[#1A1918]">
              {project.title}
            </h3>
            <p className="text-[1rem] leading-[1.5] text-[#9C9B99]">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#EDECEA] px-2.5 py-1 text-[0.875rem] text-[#6D6C6A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="mt-8 text-base text-[#B5B4B2]">
          No projects match the selected filters.
        </p>
      )}
    </section>
  );
}
