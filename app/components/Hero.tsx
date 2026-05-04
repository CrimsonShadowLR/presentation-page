"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

const codeSnippets = [
  { text: "{ }", layer: 0, size: 72, opacity: 0.4, x: 5, y: 15 },
  { text: "=>", layer: 0, size: 56, opacity: 0.35, x: 88, y: 10 },
  { text: "</>", layer: 0, size: 64, opacity: 0.3, x: 70, y: 75 },
  { text: "async", layer: 1, size: 36, opacity: 0.5, x: 8, y: 55 },
  { text: "const", layer: 1, size: 32, opacity: 0.45, x: 85, y: 35 },
  { text: "return", layer: 1, size: 28, opacity: 0.4, x: 45, y: 85 },
  { text: "import", layer: 1, size: 30, opacity: 0.48, x: 15, y: 30 },
  { text: "export", layer: 1, size: 28, opacity: 0.42, x: 60, y: 20 },
  { text: "<React>", layer: 2, size: 48, opacity: 0.6, x: 20, y: 50 },
  { text: "useState", layer: 2, size: 42, opacity: 0.55, x: 75, y: 60 },
  { text: "API", layer: 2, size: 38, opacity: 0.5, x: 35, y: 12 },
  { text: "query", layer: 2, size: 32, opacity: 0.45, x: 25, y: 80 },
  { text: "async/await", layer: 2, size: 28, opacity: 0.5, x: 55, y: 75 },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const snippetElements = container.querySelectorAll(".parallax-snippet");

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      };
    };

    container.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const { x, y } = mouseRef.current;

      snippetElements.forEach((el) => {
        const layer = parseInt(el.getAttribute("data-layer") || "0");
        const speed = [0.015, 0.04, 0.08][layer] || 0.02;
        
        const targetX = x * speed;
        const targetY = y * speed;

        anime.set(el, {
          translateX: targetX,
          translateY: targetY,
        });
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col gap-3 overflow-hidden px-8 pt-16 pb-12 sm:px-16 lg:px-16 lg:pt-20 lg:pb-12"
    >
      {/* Parallax Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {codeSnippets.map((snippet, i) => (
          <div
            key={i}
            className="parallax-snippet absolute select-none font-mono font-light"
            data-layer={snippet.layer}
            style={{
              left: `${snippet.x}%`,
              top: `${snippet.y}%`,
              fontSize: `${snippet.size}px`,
              opacity: snippet.opacity,
              color: snippet.layer === 2 
                ? "var(--cyan-primary)" 
                : snippet.layer === 1 
                  ? "var(--text-secondary)" 
                  : "var(--text-tertiary)",
              textShadow: snippet.layer === 2 
                ? "0 0 40px var(--cyan-primary)" 
                : snippet.layer === 1 
                  ? "0 0 20px rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            {snippet.text}
          </div>
        ))}
      </div>

      {/* Content */}
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
      
    </section>
  );
}