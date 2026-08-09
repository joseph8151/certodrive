// Detects messages that look like off-platform dealing or price negotiation —
// customers and drivers must keep pricing and payment on Certo Drive. Flagged
// messages are still delivered but marked for admin review, and the sender
// sees a caution.
const KEYWORDS = [
  // Korean — payment / off-platform
  "계좌", "송금", "이체", "입금", "현금", "현찰", "직거래", "직접결제", "현장결제",
  "따로", "깎", "할인해", "수수료", "페이팔", "벤모", "제로페이",
  // Korean — moving contact off-platform
  "카톡", "카카오", "카카오톡", "라인", "텔레", "텔레그램", "왓츠앱", "인스타",
  // English
  "paypal", "venmo", "zelle", "cashapp", "wire transfer", "bank transfer",
  "off the app", "off platform", "cash only", "whatsapp", "telegram", "discount",
];

export function isFlaggedMessage(text: string): boolean {
  const t = text.toLowerCase();
  if (KEYWORDS.some((k) => t.includes(k.toLowerCase()))) return true;
  // A long run of digits often means a phone or account number being shared.
  const digits = (t.match(/\d/g) || []).length;
  if (digits >= 9) return true;
  return false;
}
