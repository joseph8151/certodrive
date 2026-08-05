import "server-only";

// Lightweight OAuth for social login (Google + Kakao), matching the app's
// custom session auth. Env-gated: a provider's buttons only appear when its
// keys are configured. No external auth library.
export type ProviderId = "google" | "kakao";

export function authProviders() {
  return {
    google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    kakao: !!process.env.KAKAO_CLIENT_ID,
  };
}

type ProviderDef = {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  profile: (accessToken: string) => Promise<{ email: string; name: string } | null>;
};

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    async profile(token) {
      const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      const d = await res.json();
      if (!d?.email) return null;
      return { email: String(d.email).toLowerCase(), name: d.name || String(d.email).split("@")[0] };
    },
  },
  kakao: {
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    scope: "account_email profile_nickname",
    clientId: () => process.env.KAKAO_CLIENT_ID,
    clientSecret: () => process.env.KAKAO_CLIENT_SECRET,
    async profile(token) {
      const res = await fetch("https://kapi.kakao.com/v2/user/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      const d = await res.json();
      const acc = d?.kakao_account ?? {};
      const email = acc.email ? String(acc.email).toLowerCase() : `kakao_${d.id}@kakao.local`;
      const name = acc.profile?.nickname || d?.properties?.nickname || "Kakao 회원";
      return { email, name };
    },
  },
};

export function requestOrigin(req: Request): string {
  const h = req.headers;
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || new URL(req.url).host;
  return `${proto}://${host}`;
}
