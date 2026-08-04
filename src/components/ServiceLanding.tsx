import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingWidget from "@/components/BookingWidget";
import type { Locale } from "@/lib/i18n";

export default function ServiceLanding({
  locale,
  serviceType,
  title,
  subtitle,
  points,
}: {
  locale: Locale;
  serviceType: string;
  title: string;
  subtitle: string;
  points: { t: string; d: string }[];
}) {
  return (
    <>
      <SiteHeader />
      <section className="hero-gradient text-white">
        <div className="container-cd py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-[var(--color-gold)]">CERTO DRIVE</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">{title}</h1>
            <p className="mt-4 text-white/75 text-lg max-w-lg">{subtitle}</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {points.map((p) => (
                <div key={p.t} className="border-l-2 border-[var(--color-gold)] pl-3">
                  <div className="font-semibold">{p.t}</div>
                  <div className="text-sm text-white/60">{p.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div id="book" className="scroll-mt-20">
            <BookingWidget locale={locale} serviceType={serviceType} />
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
