import Projects from "./projects";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1918] font-[family-name:var(--font-geist-sans)]">
      {/* Hero */}
      <section className="px-8 pt-16 pb-12 sm:px-16 lg:px-[7.5rem] lg:pt-[7.5rem] lg:pb-[5rem]">
        <h1 className="text-6xl font-semibold tracking-[-0.125rem] text-[#1A1918] lg:text-[4rem]">
          Your Name
        </h1>
        <p className="mt-4 text-xl text-[#6D6C6A] lg:text-[1.5rem]">
          Web &amp; Software Developer
        </p>
        <p className="mt-4 max-w-[35rem] text-lg leading-[1.6] text-[#9C9B99]">
          I build clean, performant applications with modern technologies.
          Focused on crafting thoughtful user experiences and reliable systems.
        </p>
      </section>

      <Projects />

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#E5E0D8] px-8 py-10 sm:flex-row sm:px-16 lg:px-[7.5rem]">
        <span className="text-[0.9375rem] text-[#9C9B99]">&copy; 2026 Your Name</span>
        <div className="flex gap-6">
          <a href="#" className="text-[0.9375rem] text-[#6D6C6A] hover:text-[#1A1918] transition-colors">
            GitHub
          </a>
          <a href="#" className="text-[0.9375rem] text-[#6D6C6A] hover:text-[#1A1918] transition-colors">
            LinkedIn
          </a>
          <a href="#" className="text-[0.9375rem] text-[#6D6C6A] hover:text-[#1A1918] transition-colors">
            Email
          </a>
        </div>
      </footer>
    </div>
  );
}
