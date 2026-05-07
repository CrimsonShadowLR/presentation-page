import Projects from "./projects";
import Hero from "./components/Hero";
import ParallaxBackground from "./components/ParallaxBackground";

const education = {
  institution: "Pontificia Universidad Católica del Perú",
  location: "Lima, Peru",
  degree: "B.Sc. Informatics Engineering",
  dates: "2018 – 2022",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dd/PUCP_logo.png",
};

const START_YEAR = 2019;

export default function Home() {
  const yearsOfExperience = new Date().getFullYear() - START_YEAR;
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-[family-name:var(--font-sora)]">
      <main className="max-w-[100rem] mx-auto w-full">
        <Hero />

        {/* Experience & Education */}
        <ParallaxBackground>
          <section className="px-8 pb-12 sm:px-16 lg:px-16">
            <h2
              className="animate-fade-up text-xs font-medium tracking-[0.5px] text-[var(--text-tertiary)] uppercase"
              style={{ animationDelay: "400ms" }}
            >
              Experience &amp; Education
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2" style={{ animationDelay: "480ms" }}>
              {/* Years of Experience Badge */}
              <div className="animate-fade-up group relative flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--canvas)] p-4 transition-all duration-300 hover:border-[var(--cyan-primary)] hover:shadow-[0_4px_20px_rgba(61,90,128,0.15)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--cyan-primary)]">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 6L3 12l5 6M16 6l5 6-5 6"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold text-[var(--text-primary)]">{yearsOfExperience}+</span>
                  <span className="text-xs text-[var(--text-secondary)]">years building software</span>
                </div>
              </div>

              {/* Education Card */}
              <a
                href="https://www.pucp.edu.pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="animate-fade-up group relative flex items-center gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--canvas)] p-4 transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
              >
                <img
                  src={education.logoUrl}
                  alt={`${education.institution} logo`}
                  className="h-12 w-12 shrink-0 rounded-lg object-contain p-1"
                />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--cyan-primary)] transition-colors">
                    {education.degree}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {education.institution} · {education.location}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {education.dates}
                  </span>
                </div>
                <svg className="h-5 w-5 shrink-0 text-[var(--text-tertiary)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </section>
        </ParallaxBackground>

        <Projects />

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border-color)] px-8 py-8 sm:flex-row sm:px-16 lg:px-16">
          <span className="text-xs text-[var(--text-muted)]">© 2026 Leandro Lazo</span>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              GitHub
            </a>
            <a href="#" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Email
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}