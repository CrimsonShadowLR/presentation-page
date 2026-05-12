"use client";

import { useEffect } from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const experience = [
  {
    company: "FromSolvers",
    role: "Full-Stack Developer",
    dates: "2022 – 2026",
    bullets: [
      "Built full-stack digital wallet ecosystem with 3 frontend apps and 3 NestJS microservices, serving 5,000+ concurrent users",
      "Developed image processing system with crop and barcode scanning — reduced payload by 60%, processing 1,000+ tickets daily",
      "Built tournament management system with WebSocket real-time leaderboards for 500+ concurrent users and bonus distributions for 50K+ daily payouts",
      "Built multi-platform soccer application for 5,000+ active users with real-time updates and 75% query performance boost via Redis caching",
      "Implemented web animations in virtual casino games and achieved 85% test coverage with Playwright, reducing regression bugs by 60%",
    ],
  },
  {
    company: "AI Group PUCP",
    role: "Full-Stack Developer",
    dates: "2019 – 2021",
    bullets: [
      "Built geospatial web application for surface water detection with interactive map layers and dynamic coordinate/date search",
      "Integrated neural network backend with caching strategy — reduced query times by 40%",
    ],
  },
];

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-[90vw] max-w-[56rem] max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--canvas)] shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 sm:p-12">
          {/* About Me heading */}
          <h2 className="text-xs font-medium tracking-[0.5px] text-[var(--text-tertiary)] uppercase">
            About Me
          </h2>

          {/* Summary */}
          <div className="mt-6 space-y-4 text-sm leading-[1.8] text-[var(--text-secondary)]">
            <p>
              Full-stack developer from <span className="font-medium text-[var(--text-primary)]">Lima, Peru</span>, with experience building web applications and scalable systems. Specialized in <span className="text-[var(--cyan-primary)] font-medium">TypeScript</span>, <span className="text-[var(--cyan-primary)] font-medium">React</span>, <span className="text-[var(--cyan-primary)] font-medium">Node.js</span>, and <span className="text-[var(--cyan-primary)] font-medium">Python</span>, with additional experience in <span className="text-[var(--cyan-primary)] font-medium">Go</span> and <span className="text-[var(--cyan-primary)] font-medium">React Native</span>.
            </p>
            <p>
              I&apos;ve worked on microservices, real-time platforms, and data-driven applications serving thousands of concurrent users. I&apos;m adaptable across different stacks and enjoy collaborating closely with teams to build reliable products.
            </p>
            <p>
              Graduated from <span className="font-medium text-[var(--text-primary)]">Pontificia Universidad Cat&oacute;lica del Per&uacute;</span> with a B.Sc. in Informatics Engineering.
            </p>
          </div>

          {/* Career */}
          <h3 className="mt-10 text-xs font-medium tracking-[0.5px] text-[var(--text-tertiary)] uppercase">
            Career
          </h3>

          <div className="mt-6 space-y-8">
            {experience.map((job) => (
              <div key={job.company}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h4 className="text-base font-medium text-[var(--text-primary)]">
                    {job.company}{" "}
                    <span className="text-sm font-normal text-[var(--text-secondary)]">
                      · {job.role}
                    </span>
                  </h4>
                  <span className="text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[var(--text-tertiary)]">
                    {job.dates}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {job.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-[1.7] text-[var(--text-secondary)]"
                    >
                      <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-[var(--text-tertiary)]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <h3 className="mt-10 text-xs font-medium tracking-[0.5px] text-[var(--text-tertiary)] uppercase">
            Education
          </h3>

          <div className="mt-6">
            <h4 className="text-base font-medium text-[var(--text-primary)]">
              B.Sc. Informatics Engineering
            </h4>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Pontificia Universidad Cat&oacute;lica del Per&uacute;{" "}
              <span className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[var(--text-tertiary)]">
                · 2018 – 2022
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
