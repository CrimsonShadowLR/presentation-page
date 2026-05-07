export default function Hero() {
  return (
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
    </section>
  );
}
