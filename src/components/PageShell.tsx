import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <section className="hero-gradient text-white">
        <div className="container-cd py-14 md:py-16">
          <p className="eyebrow text-[var(--color-gold)]">CERTO DRIVE</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-3 max-w-3xl">{title}</h1>
          {subtitle && <p className="mt-4 text-white/75 max-w-2xl">{subtitle}</p>}
        </div>
      </section>
      <main className="container-cd py-12 md:py-16">{children}</main>
      <SiteFooter />
    </>
  );
}

export function Prose({ sections }: { sections: { h?: string; body: string | string[] }[] }) {
  return (
    <div className="max-w-3xl mx-auto grid gap-8">
      {sections.map((s, i) => (
        <div key={i}>
          {s.h && <h2 className="font-display text-2xl font-bold mb-3">{s.h}</h2>}
          {(Array.isArray(s.body) ? s.body : [s.body]).map((p, j) => (
            <p key={j} className="text-[var(--color-slate)] leading-relaxed mb-3">{p}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
