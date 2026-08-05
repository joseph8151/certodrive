import type { Locale } from "@/lib/i18n";

// Social sign-in buttons. Renders only the providers that are configured
// (keys present). Each is a plain link into the OAuth start route.
export default function SocialButtons({
  providers,
  locale,
}: {
  providers: { google: boolean; kakao: boolean };
  locale: Locale;
}) {
  const L = locale === "ko";
  if (!providers.google && !providers.kakao) return null;

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center gap-3 my-1 text-xs text-[var(--color-slate)]">
        <span className="h-px flex-1 bg-[var(--color-line)]" />
        {L ? "간편 로그인" : "or continue with"}
        <span className="h-px flex-1 bg-[var(--color-line)]" />
      </div>

      {providers.kakao && (
        <a href="/api/auth/oauth/kakao" className="btn w-full font-semibold" style={{ background: "#FEE500", color: "#191600" }}>
          <span aria-hidden className="mr-1">💬</span> {L ? "카카오로 시작하기" : "Continue with Kakao"}
        </a>
      )}

      {providers.google && (
        <a href="/api/auth/oauth/google" className="btn w-full font-semibold bg-white border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-mist)]">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="mr-1">
            <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.6-.2-2.3H12v4.4h6.5c-.1 1.1-.8 2.7-2.3 3.8l3.6 2.8c2.1-2 3.7-4.9 3.7-8.7z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.6-2.8c-1 .7-2.3 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.2L1.1 17c2 3.9 6 7 10.9 7z" />
            <path fill="#FBBC05" d="M4.9 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.1 6.9C.4 8.4 0 10.1 0 12s.4 3.6 1.1 5.1l3.8-2.8z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3 .8 3.7 1.4l2.7-2.7C16.9 1.9 14.6 1 12 1 7.1 1 3.1 4.1 1.1 8l3.8 2.8C5.9 7 8.7 4.8 12 4.8z" />
          </svg>
          {L ? "구글로 시작하기" : "Continue with Google"}
        </a>
      )}
    </div>
  );
}
