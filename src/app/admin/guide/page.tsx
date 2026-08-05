import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { paymentConfig } from "@/lib/payments";

export default async function AdminGuide() {
  const locale = await getLocale();
  const L = locale === "ko";
  const pay = paymentConfig();
  const payStatus = [
    { key: "PayPal", on: pay.paypal, note: L ? "해외 카드·페이팔" : "International" },
    { key: L ? "한국 결제 (PortOne)" : "Korean (PortOne)", on: pay.portone, note: L ? "카카오·네이버·토스·카드" : "KakaoPay/Naver/Toss" },
    { key: L ? "계좌이체·데모" : "Manual", on: pay.allowManual, note: L ? "게이트웨이 미설정 시 대체" : "Fallback" },
  ];

  // Korean-first operations manual for staff. English kept minimal.
  return (
    <div className="max-w-3xl grid gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{L ? "운영 가이드" : "Operations guide"}</h1>
        <p className="text-[var(--color-slate)] mt-2 text-sm leading-relaxed">
          {L
            ? "체르토 드라이브 운영에 필요한 핵심 절차를 정리했습니다. 특히 기사 등록 방식과 예약 처리 흐름을 확인하세요."
            : "Key procedures for running Certo Drive — driver registration and the booking workflow."}
        </p>
      </div>

      {/* Driver registration — the two methods */}
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">{L ? "기사 등록: 두 가지 방식" : "Driver registration: two ways"}</h2>
        <p className="text-sm text-[var(--color-slate)] mt-2">
          {L ? "우리 시스템은 두 가지를 모두 지원합니다. 상황에 맞게 사용하세요." : "The system supports both. Use whichever fits."}
        </p>

        <div className="mt-5 grid gap-5">
          <div className="rounded-xl border border-[var(--color-line)] p-5 bg-white">
            <div className="flex items-center gap-2">
              <span className="pill pill-blue">{L ? "방식 A" : "Method A"}</span>
              <h3 className="font-semibold">{L ? "기사가 직접 신청 (셀프 등록)" : "Driver applies (self-serve)"}</h3>
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--color-slate)] list-decimal pl-5 leading-relaxed">
              <li>{L ? <>기사가 홈페이지 하단 <b>“기사 파트너”</b> 또는 <Link href="/partners" className="text-[var(--color-navy)] underline">/partners</Link> 페이지에서 직접 신청서를 작성합니다. (사업자 유형, 지역·공항, 한국어 수준, 면허·보험 서류, 공급가 등)</> : "Driver fills the application at /partners."}</li>
              <li>{L ? <>신청이 접수되면 <b>기사 메뉴</b>(<Link href="/admin/drivers" className="text-[var(--color-navy)] underline">/admin/drivers</Link>)에 <span className="pill pill-amber">PENDING</span> 상태로 나타납니다.</> : "It appears under Drivers as PENDING."}</li>
              <li>{L ? <>담당 직원이 서류를 검토하고 <b>“승인”</b> 버튼을 누르면 활성화됩니다. (문제가 있으면 “반려”)</> : "Staff reviews and clicks Approve (or Reject)."}</li>
            </ol>
            <p className="mt-3 text-xs text-[var(--color-slate)]">{L ? "→ 기사 수가 많거나, 기사 스스로 서류를 올리게 하고 싶을 때 적합합니다." : "→ Best at scale, when drivers upload their own documents."}</p>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] p-5 bg-white">
            <div className="flex items-center gap-2">
              <span className="pill pill-green">{L ? "방식 B" : "Method B"}</span>
              <h3 className="font-semibold">{L ? "직원이 대신 등록 (즉시 승인)" : "Staff registers on their behalf"}</h3>
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--color-slate)] list-decimal pl-5 leading-relaxed">
              <li>{L ? <><Link href="/admin/drivers" className="text-[var(--color-navy)] underline">/admin/drivers</Link> 상단의 <b>“새 기사 추가”</b> 버튼을 누릅니다.</> : "Click “Add driver” at the top of /admin/drivers."}</li>
              <li>{L ? "이름·이메일·지역·차량 등 정보를 입력하고 저장합니다. (초기 비밀번호 미입력 시 password123)" : "Enter name, email, region, vehicle, then save (default password password123)."}</li>
              <li>{L ? <>저장 즉시 <span className="pill pill-green">APPROVED</span> 상태로 등록되어 바로 배차에 사용할 수 있습니다.</> : "The driver is created already APPROVED and ready for dispatch."}</li>
            </ol>
            <p className="mt-3 text-xs text-[var(--color-slate)]">{L ? "→ 전화로 모집한 기사, 잘 아는 기사, 빠르게 영업을 시작할 때 적합합니다. 등록 후 기사에게 이메일·비밀번호를 전달하세요." : "→ Best for phone-recruited or known drivers. Share the login afterwards."}</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-[var(--color-mist)] p-4 text-sm">
          <b>{L ? "등록 후 기사는?" : "After registration"}</b>
          <p className="text-[var(--color-slate)] mt-1 leading-relaxed">
            {L ? <>기사는 자신의 이메일/비밀번호로 <Link href="/login" className="text-[var(--color-navy)] underline">로그인</Link> 후 <b>기사 대시보드</b>(/driver)에서 배정된 예약을 확인하고, /driver/profile 에서 수락 가능 여부를 켜고 끕니다. 정산 내역은 /driver/earnings 에서 봅니다.</> : "Drivers log in and use /driver, /driver/profile and /driver/earnings."}
          </p>
        </div>
      </section>

      {/* Payment status */}
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">{L ? "결제 연동 상태" : "Payment integrations"}</h2>
        <p className="text-sm text-[var(--color-slate)] mt-2">
          {L ? "Vercel 환경변수에 키를 넣고 재배포하면 자동으로 켜집니다." : "Add keys to Vercel env vars and redeploy to enable."}
        </p>
        <div className="mt-4 grid gap-2">
          {payStatus.map((p) => (
            <div key={p.key} className="flex items-center justify-between rounded-lg border border-[var(--color-line)] px-4 py-3">
              <div>
                <span className="font-semibold text-sm">{p.key}</span>
                <span className="text-xs text-[var(--color-slate)] ml-2">{p.note}</span>
              </div>
              <span className={`pill ${p.on ? "pill-green" : "pill-slate"}`}>{p.on ? (L ? "활성" : "Active") : (L ? "미설정" : "Off")}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-[var(--color-mist)] p-4 text-xs text-[var(--color-slate)] leading-relaxed">
          <b>PayPal</b> {L ? "설정: Vercel 환경변수에" : "setup — add to Vercel env:"} <code>PAYPAL_CLIENT_ID</code>, <code>PAYPAL_CLIENT_SECRET</code>, <code>PAYPAL_ENV=live</code> {L ? "추가 후 재배포." : "then redeploy."}
        </div>
      </section>

      {/* Booking workflow */}
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">{L ? "예약 처리 흐름" : "Booking workflow"}</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-relaxed list-decimal pl-5">
          <li>{L ? <><b>예약 접수</b> — 고객이 예약하면 <Link href="/admin/bookings" className="text-[var(--color-navy)] underline">/admin/bookings</Link>에 표시됩니다. 등록된 노선은 즉시 가격 확정, 아니면 “견적 요청” 상태.</> : "Bookings arrive at /admin/bookings."}</li>
          <li>{L ? <><b>가격 확정</b> — 견적 요청 건은 기사 공급가를 확인하고 최종 정찰 가격을 설정합니다. → 고객에게 결제 요청 자동 발송.</> : "Set the final price for quote requests."}</li>
          <li>{L ? <><b>결제 확인</b> — 카드 결제 또는 관리자가 수동으로 결제 확인.</> : "Confirm payment."}</li>
          <li>{L ? <><b>기사 배정</b> — 지역·차량에 맞는 기사를 배정합니다. → 고객·기사에게 알림 발송.</> : "Assign a driver."}</li>
          <li>{L ? <><b>바우처 발송</b> — 고객용·기사용 바우처를 생성해 전달합니다.</> : "Generate vouchers."}</li>
          <li>{L ? <><b>운행 완료 → 정산</b> — 운행 후 <Link href="/admin/settlements" className="text-[var(--color-navy)] underline">/admin/settlements</Link>에서 기사 정산을 기록합니다.</> : "Record settlement after the trip."}</li>
        </ol>
      </section>

      {/* Go-live checklist */}
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">{L ? "영업 시작 체크리스트" : "Go-live checklist"}</h2>
        <ul className="mt-4 grid gap-2.5 text-sm">
          {[
            L ? <>기사 최소 1~2명 등록 (<Link href="/admin/drivers" className="text-[var(--color-navy)] underline">기사</Link>)</> : "Register 1–2 drivers",
            L ? <>주요 노선 가격 등록 (<Link href="/admin/pricing" className="text-[var(--color-navy)] underline">가격 관리</Link>)</> : "Add route prices",
            L ? <>환율 확인 (<Link href="/admin/rates" className="text-[var(--color-navy)] underline">환율</Link>)</> : "Check exchange rates",
            L ? <>관리자 비밀번호 변경</> : "Change the admin password",
            L ? <>첫 테스트 예약 넣어보기</> : "Place a test booking",
          ].map((x, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[var(--color-gold-dark)] mt-0.5">✓</span>
              <span className="text-[var(--color-slate)]">{x}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
