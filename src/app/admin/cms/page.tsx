import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { safeJson } from "@/lib/utils";
import CityContentForm, { type CityContentInit } from "@/components/CityContentForm";
import AdminQuickAction from "@/components/AdminQuickAction";

export default async function AdminCMS({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const locale = await getLocale();
  const L = locale === "ko";
  const { city } = await searchParams;

  const entries = await prisma.cityContent.findMany({ orderBy: { updatedAt: "desc" } });
  const editing = city ? entries.find((e) => e.city === city) : undefined;

  const initial: CityContentInit | undefined = editing
    ? {
        city: editing.city, country: editing.country ?? "", headline: editing.headline ?? "", intro: editing.intro ?? "",
        faqText: safeJson<{ q: string; a: string }[]>(editing.faq, []).map((x) => `${x.q} | ${x.a}`).join("\n"),
        metaTitle: editing.metaTitle ?? "", metaDescription: editing.metaDescription ?? "", published: editing.published,
      }
    : undefined;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "도시 랜딩 CMS" : "City landing CMS"}</h1>
        <p className="text-sm text-[var(--color-slate)] mt-1">{L ? "도시별 랜딩 페이지의 문구·FAQ·SEO를 편집합니다. 저장한 도시는 /destinations/도시명 에 반영됩니다." : "Edit copy, FAQ and SEO for each city landing page. Saved cities render at /destinations/<city>."}</p>
      </div>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-4">{editing ? (L ? `"${editing.city}" 편집` : `Edit "${editing.city}"`) : (L ? "새 도시 콘텐츠" : "New city content")}</h2>
        {/* key forces a fresh form when switching between edit targets */}
        <CityContentForm key={editing?.id ?? "new"} locale={locale} initial={initial} />
        {editing && <Link href="/admin/cms" className="inline-block mt-3 text-sm text-[var(--color-navy)]">{L ? "+ 새로 만들기" : "+ Create new"}</Link>}
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "등록된 도시 콘텐츠" : "City content"} ({entries.length})</h2>
        <div className="card overflow-hidden">
          <table className="tbl">
            <thead><tr><th>{L ? "도시" : "City"}</th><th>{L ? "헤드라인" : "Headline"}</th><th>{L ? "상태" : "Status"}</th><th></th></tr></thead>
            <tbody>
              {entries.length === 0 && <tr><td colSpan={4} className="text-center text-[var(--color-slate)] py-6">{L ? "등록된 콘텐츠가 없습니다." : "No content yet."}</td></tr>}
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium">{e.city}</td>
                  <td className="max-w-[260px] truncate text-[var(--color-slate)]">{e.headline ?? "—"}</td>
                  <td><span className={`pill ${e.published ? "pill-green" : "pill-slate"}`}>{e.published ? (L ? "공개" : "Published") : (L ? "비공개" : "Draft")}</span></td>
                  <td className="text-right whitespace-nowrap">
                    <span className="inline-flex gap-2 items-center">
                      <Link href={`/admin/cms?city=${encodeURIComponent(e.city)}`} className="text-sm text-[var(--color-navy)] font-medium">{L ? "편집" : "Edit"}</Link>
                      <Link href={`/destinations/${encodeURIComponent(e.city)}`} className="text-sm text-[var(--color-slate)]" target="_blank">{L ? "보기" : "View"}</Link>
                      <AdminQuickAction body={{ action: "DELETE_CITY_CONTENT", contentId: e.id }} label={L ? "삭제" : "Delete"} variant="ghost" confirmText={L ? "삭제할까요?" : "Delete?"} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
