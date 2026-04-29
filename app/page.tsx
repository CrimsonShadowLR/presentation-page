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
    <div className="min-h-screen bg-[#F7F6F3] text-[#2D2D2D] font-[family-name:var(--font-sora)]">
      {/* Hero */}
      <section className="flex flex-col gap-3 px-8 pt-16 pb-12 sm:px-16 lg:px-16 lg:pt-20 lg:pb-12 max-w-[100rem] mx-auto w-full">
        <h1
          className="animate-fade-up text-5xl font-light tracking-[-1px] text-[#2D2D2D] lg:text-[48px]"
          style={{ animationDelay: "0ms" }}
        >
          Leandro Lazo
        </h1>
        <p
          className="animate-fade-up text-sm font-medium tracking-[0.5px] text-[#3D5A80]"
          style={{ animationDelay: "120ms" }}
        >
          Web &amp; Software Developer
        </p>
        <div
          className="animate-fade-in h-0.5 w-8 rounded-sm bg-[#C53D43]"
          style={{ animationDelay: "240ms" }}
        />
        <p
          className="animate-fade-up max-w-[30rem] text-sm leading-[1.6] text-[#6B7280]"
          style={{ animationDelay: "320ms" }}
        >
          I build clean, performant applications with modern technologies.
          Focused on crafting thoughtful user experiences and reliable systems.
        </p>
      </section>

      {/* Experience & Education */}
      <section className="px-8 pb-12 sm:px-16 lg:px-16 max-w-[100rem] mx-auto w-full">
        <h2
          className="animate-fade-up text-xs font-medium tracking-[0.5px] text-[#9CA3AF] uppercase"
          style={{ animationDelay: "400ms" }}
        >
          Experience & Education
        </h2>
        <div
          className="animate-fade-up mt-4 flex flex-col gap-6 md:flex-row md:gap-16"
          style={{ animationDelay: "480ms" }}
        >
          <div>
            <p className="text-sm text-[#2D2D2D]">{yearsOfExperience}+ years building software</p>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={education.logoUrl}
              alt={`${education.institution} logo`}
              className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#2D2D2D]">
                {education.degree}
              </span>
              <span className="text-xs text-[#6B7280]">
                {education.institution} · {education.location} · {education.dates}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Projects />

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#E8E6E1] px-8 py-8 sm:flex-row sm:px-16 lg:px-16">
        <span className="text-xs text-[#9CA3AF]">&copy; 2026 Leandro Lazo</span>
        <div className="flex gap-5">
          <a href="#" className="text-xs text-[#6B7280] hover:text-[#2D2D2D] transition-colors">
            GitHub
          </a>
          <a href="#" className="text-xs text-[#6B7280] hover:text-[#2D2D2D] transition-colors">
            LinkedIn
          </a>
          <a href="#" className="text-xs text-[#6B7280] hover:text-[#2D2D2D] transition-colors">
            Email
          </a>
        </div>
      </footer>
    </div>
  );
}
