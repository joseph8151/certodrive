import { cookies } from "next/headers";
import type { Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get("cd_locale")?.value;
  return v === "en" ? "en" : "ko";
}
