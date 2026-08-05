import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seedData";

export const dynamic = "force-dynamic";

// One-click production bootstrap. Populates an empty database with the first
// admin account, pricing config, registered routes, demo drivers and sample
// reviews so the platform is operable right after deploy.
//
// Safety: runs only while no admin exists yet, OR when the caller supplies the
// correct ?key= matching the SETUP_KEY env var. Never destroys existing data
// (seedDatabase is idempotent / upsert-based).

function page(title: string, bodyHtml: string, accent = "#14294f") {
  return new Response(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · Certo Drive</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:#f8fafc;color:#171a22;display:grid;place-items:center;min-height:100vh;padding:24px}
  .card{background:#fff;border:1px solid #dde2ea;border-radius:16px;max-width:520px;width:100%;padding:32px;box-shadow:0 12px 32px -12px rgba(10,14,23,.14)}
  .badge{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${accent}}
  h1{font-size:24px;margin:8px 0 4px}
  p{color:#5b6272;line-height:1.6;margin:6px 0}
  .box{background:#f4f6fb;border:1px solid #e3e8f0;border-radius:10px;padding:14px 16px;margin:16px 0;font-size:14px}
  .box b{color:#171a22}
  code{background:#eef1f6;padding:2px 6px;border-radius:5px;font-size:13px}
  a.btn{display:inline-block;background:${accent};color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px;margin-top:8px}
  .muted{font-size:12px;color:#8b93a1;margin-top:18px}
</style></head><body><div class="card">${bodyHtml}</div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

async function run(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const configured = process.env.SETUP_KEY;

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const authorized = adminCount === 0 || (!!configured && key === configured);

  if (!authorized) {
    return { status: 403 as const, ok: false, error: "이미 설정이 완료되어 잠겨 있습니다. 다시 실행하려면 ?key=<SETUP_KEY> 를 붙여 호출하세요." };
  }
  try {
    const result = await seedDatabase();
    return { status: 200 as const, ok: true, login: { email: result.admin, password: result.password } };
  } catch (e) {
    console.error("[setup] seeding failed", e);
    return { status: 500 as const, ok: false, error: String((e as Error)?.message ?? e) };
  }
}

export async function GET(req: Request) {
  const r = await run(req);
  if (!r.ok || !r.login) {
    return page(
      "설정",
      `<span class="badge">SETUP</span><h1>설정을 진행할 수 없습니다</h1>
       <p>${r.error}</p>
       <a class="btn" href="/login">로그인으로 이동</a>`,
      "#a9781a"
    );
  }
  return page(
    "준비 완료",
    `<span class="badge">CERTO DRIVE</span>
     <h1>✅ 영업 준비 완료</h1>
     <p>관리자 계정과 기본 요금·노선·데모 기사·후기가 생성되었습니다. 이제 로그인해서 운영을 시작할 수 있어요.</p>
     <div class="box">
       <p style="margin:0 0 6px"><b>관리자 로그인</b></p>
       아이디: <code>${r.login.email}</code><br/>
       비밀번호: <code>${r.login.password}</code>
     </div>
     <p style="font-size:13px">첫 로그인 후 <b>비밀번호를 꼭 변경</b>하세요.</p>
     <a class="btn" href="/login">관리자 로그인 →</a>
     <p class="muted">데모 기사 로그인: driver.seoul@certodrive.com / password123 (파리·도쿄 동일 패턴)</p>`
  );
}

export async function POST(req: Request) {
  const r = await run(req);
  if (!r.ok || !r.login) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
  return NextResponse.json({
    ok: true,
    message: "Certo Drive is ready. You can now sign in.",
    login: { email: r.login.email, password: r.login.password, url: "/login" },
  });
}
