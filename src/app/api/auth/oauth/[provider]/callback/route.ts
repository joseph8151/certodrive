import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { PROVIDERS, requestOrigin, type ProviderId } from "@/lib/oauth";

export const dynamic = "force-dynamic";

// OAuth callback: verify state, exchange the code, fetch the profile, then
// find-or-create the user and start a session.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const def = PROVIDERS[provider as ProviderId];
  const origin = requestOrigin(req);
  const fail = (why: string) => NextResponse.redirect(`${origin}/login?error=${why}`);
  if (!def) return fail("provider_off");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const saved = store.get("cd_oauth_state")?.value;
  store.delete("cd_oauth_state");
  if (!code || !state || saved !== `${provider}:${state}`) return fail("oauth_state");

  try {
    const redirectUri = `${origin}/api/auth/oauth/${provider}/callback`;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: def.clientId()!,
      redirect_uri: redirectUri,
    });
    if (def.clientSecret()) body.set("client_secret", def.clientSecret()!);

    const tokenRes = await fetch(def.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) return fail("oauth_token");

    const profile = await def.profile(tokenData.access_token);
    if (!profile) return fail("oauth_profile");

    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: profile.email, name: profile.name, role: "CUSTOMER", passwordHash: await hashPassword(crypto.randomUUID()) },
      });
    }
    const role = user.role as "CUSTOMER" | "DRIVER" | "ADMIN";
    await createSession({ userId: user.id, role, name: user.name, email: user.email });

    const dest = role === "ADMIN" ? "/admin" : role === "DRIVER" ? "/driver" : "/account";
    return NextResponse.redirect(`${origin}${dest}`);
  } catch {
    return fail("oauth");
  }
}
