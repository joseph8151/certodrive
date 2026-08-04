import type { Locale } from "@/lib/i18n";

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  city: string;
  driverName: string | null;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[var(--color-gold)]">
      {"★".repeat(n)}
      <span className="text-[var(--color-line)]">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function Testimonials({ reviews, locale }: { reviews: PublicReview[]; locale: Locale }) {
  const L = locale === "ko";
  if (reviews.length === 0) return null;

  return (
    <section className="section">
      <div className="container-cd">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{L ? "고객 후기" : "Reviews"}</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
            {L ? "여행자들이 남긴 실제 후기" : "What travelers say"}
          </h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <figure key={r.id} className="card p-6 flex flex-col">
              <Stars n={r.rating} />
              {r.comment && <blockquote className="mt-3 text-[15px] leading-relaxed">“{r.comment}”</blockquote>}
              <figcaption className="mt-4 text-sm text-[var(--color-slate)]">
                {r.authorName ?? (L ? "고객" : "Traveler")} · {r.city}
                {r.driverName ? ` · ${L ? "기사" : "Driver"} ${r.driverName}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
