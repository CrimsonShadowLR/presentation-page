import Projects from "./projects";

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
        {/* Hero */}
        <section className="flex flex-col gap-3 px-8 pt-16 pb-12 sm:px-16 lg:px-16 lg:pt-20 lg:pb-12">
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
          <div
            className="animate-fade-in h-0.5 w-8 rounded-sm bg-[var(--danger-high)]"
            style={{ animationDelay: "240ms" }}
          />
          <p
            className="animate-fade-up max-w-[30rem] text-sm leading-[1.6] text-[var(--text-secondary)]"
            style={{ animationDelay: "320ms" }}
          >
            I build clean, performant applications with modern technologies.
            Focused on crafting thoughtful user experiences and reliable systems.
          </p>
        </section>

        {/* Experience & Education */}
        <section className="px-8 pb-12 sm:px-16 lg:px-16">
          <h2
            className="animate-fade-up text-xs font-medium tracking-[0.5px] text-[var(--text-tertiary)] uppercase"
            style={{ animationDelay: "400ms" }}
          >
            Experience &amp; Education
          </h2>
          <div
            className="animate-fade-up mt-4 flex flex-col gap-6 md:flex-row md:gap-16"
            style={{ animationDelay: "480ms" }}
          >
            <div>
              <p className="text-sm text-[var(--text-primary)]">{yearsOfExperience}+ years building software</p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={education.logoUrl}
                alt={`${education.institution} logo`}
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {education.degree}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {education.institution} · {education.location} · {education.dates}
                </span>
              </div>
            </div>
          </div>
        </section>

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