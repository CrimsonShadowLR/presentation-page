"use client";

import { useState } from "react";
import AboutModal from "./AboutModal";

export default function Hero() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <section className="flex items-start justify-between px-8 pt-16 pb-12 sm:px-16 lg:px-16 lg:pt-20 lg:pb-12">
        <div className="flex flex-col gap-3">
          <h1
            className="animate-fade-up text-5xl font-light tracking-[-1px] text-[var(--text-primary)] lg:text-[48px]"
            style={{ animationDelay: "0ms" }}
          >
            Leandro Lazo
          </h1>
          <p
            className="animate-fade-up text-sm font-medium tracking-[0.5px] text-[var(--cyan-primary)]"
            style={{ animationDelay: "120ms" }}
          >
            Web &amp; Software Developer
          </p>
        </div>

        <button
          onClick={() => setAboutOpen(true)}
          className="animate-fade-up mr-[15%] rounded-xl border border-[var(--border-color)] bg-[var(--canvas)] px-8 py-3 text-base font-medium text-[var(--text-secondary)] transition-all duration-300 hover:border-[var(--cyan-primary)] hover:text-[var(--cyan-primary)] hover:shadow-[0_2px_12px_rgba(61,90,128,0.12)] hover:-translate-y-0.5"
          style={{ animationDelay: "240ms" }}
        >
          About Me
        </button>
      </section>

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
