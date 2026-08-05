import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { PROVIDERS, requestOrigin, type ProviderId } from "@/lib/oauth";

export const dynamic = "force-dynamic";

// Start the OAuth flow: set a CSRF state cookie and redirect to the provider.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const def = PROVIDERS[provider as ProviderId];
  const origin = requestOrigin(req);
  if (!def || !def.clientId()) return NextResponse.redirect(`${origin}/login?error=provider_off`);

  const state = crypto.randomUUID();
  const redirectUri = `${origin}/api/auth/oauth/${provider}/callback`;

  const url = new URL(def.authorizeUrl);
  url.searchParams.set("client_id", def.clientId()!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", def.scope);
  url.searchParams.set("state", state);

  const store = await cookies();
  store.set("cd_oauth_state", `${provider}:${state}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600,
  });
  return NextResponse.redirect(url.toString());
}
