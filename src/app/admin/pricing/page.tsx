import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import PriceRuleForm from "@/components/PriceRuleForm";
import AdminQuickAction from "@/components/AdminQuickAction";

export default async function AdminPricing() {
  const locale = await getLocale();
  const L = locale === "ko";

  const [rules, policies, config] = await Promise.all([
    prisma.priceRule.findMany({ orderBy: [{ country: "asc" }, { city: "asc" }] }),
    prisma.commissionPolicy.findMany({ orderBy: { priority: "desc" } }),
    prisma.pricingConfig.findUnique({ where: { id: "default" } }),
  ]);

  return (
    <div className="grid gap-8">
      <h1 className="font-display text-2xl font-bold">{L ? "가격 관리" : "Pricing management"}</h1>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-4">{L ? "노선 가격 등록" : "Add a registered route price"}</h2>
        <p className="text-sm text-[var(--color-slate)] mb-4">
          {L ? "등록된 노선은 고객에게 즉시 가격을 표시합니다. 픽업/목적지 표기는 예약창 선택값과 일치해야 합니다."
             : "Registered routes show customers an instant price. Pickup/destination labels should match the booking widget values."}
        </p>
        <PriceRuleForm locale={locale} />
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "등록된 노선" : "Registered routes"} ({rules.length})</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L ? "국가/도시" : "Country/City"}</th>
                  <th>{L ? "노선" : "Route"}</th>
                  <th>{L ? "차량" : "Vehicle"}</th>
                  <th>{L ? "공급가" : "Supply"}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--color-slate)] py-6">{L ? "등록된 노선이 없습니다." : "No routes yet."}</td></tr>}
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{r.country} · {r.city}</td>
                    <td className="max-w-[240px] truncate">{r.pickupLocation} → {r.destination}</td>
                    <td className="text-xs whitespace-nowrap">{r.vehicleCategory}</td>
                    <td className="whitespace-nowrap font-medium">{formatMoney(r.driverSupplyPrice, r.currency)}</td>
                    <td className="text-right"><AdminQuickAction body={{ action: "DELETE_PRICE_RULE", ruleId: r.id }} label={L ? "삭제" : "Delete"} variant="ghost" confirmText={L ? "삭제할까요?" : "Delete this route?"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">{L ? "수수료 정책" : "Commission policies"}</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{L ? "범위" : "Scope"}</th>
                  <th>{L ? "대상" : "Target"}</th>
                  <th>{L ? "수수료율" : "Rate"}</th>
                  <th>{L ? "최소 예약 수수료" : "Min booking fee"}</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td>{p.scope}</td>
                    <td>{p.country ?? p.city ?? (p.scope === "GLOBAL" ? (L ? "전체" : "All") : "—")}</td>
                    <td>{(p.commissionRate * 100).toFixed(0)}%</td>
                    <td>{formatMoney(p.minBookingFee, p.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-[var(--color-slate)] mt-2">
          {L ? "가장 구체적인 정책이 우선 적용됩니다 (노선 > 도시 > 국가 > 전체). 서유럽 장거리는 낮은 수수료율, 단거리는 최소 예약 수수료로 마진을 확보합니다."
             : "The most specific policy wins (route > city > country > global). Long-haul Western Europe uses a low rate; short-haul relies on the minimum booking fee."}
        </p>
      </section>

      {config && (
        <section>
          <h2 className="font-semibold text-lg mb-3">{L ? "할증 및 부가 요금" : "Surcharges & fees"}</h2>
          <div className="card p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              [L ? "한국어 기사 지정" : "Korean driver", formatMoney(config.koreanDriverFee, "USD")],
              [L ? "심야 할증" : "Night surcharge", `${(config.nightSurchargeRate * 100).toFixed(0)}% (${config.nightStartHour}:00–${config.nightEndHour}:00)`],
              [L ? "휴일 할증" : "Holiday", `${(config.holidaySurchargeRate * 100).toFixed(0)}%`],
              [L ? "긴급 예약 할증" : "Urgent booking", `${(config.urgentSurchargeRate * 100).toFixed(0)}% (<${config.urgentWindowHours}h)`],
              [L ? "카시트" : "Child seat", formatMoney(config.childSeatFee, "USD")],
              [L ? "공항 피켓" : "Meet & greet", formatMoney(config.airportPicketFee, "USD")],
              [L ? "추가 대기(시간당)" : "Waiting / hr", formatMoney(config.extraWaitingFeePerHour, "USD")],
              [L ? "결제 수수료" : "Payment fee", `${(config.paymentFeeRate * 100).toFixed(1)}% + ${formatMoney(config.paymentFeeFixed, "USD")}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[var(--color-line)] pb-2">
                <span className="text-[var(--color-slate)]">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
