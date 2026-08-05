// Minimal PayPal Orders v2 client (REST via fetch — no SDK dependency).
// Sandbox by default; set PAYPAL_ENV=live for production.
const BASE = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function accessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal not configured");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal auth failed");
  const data = await res.json();
  return data.access_token as string;
}

// PayPal requires 3-letter ISO currencies; most of ours already are.
export async function createOrder(amount: number, currency: string, reference: string) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: reference,
          amount: { currency_code: currency, value: amount.toFixed(2) },
          description: `Certo Drive booking ${reference}`,
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "PayPal create order failed");
  return data as { id: string };
}

export async function captureOrder(orderId: string) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "PayPal capture failed");
  return data as {
    status: string;
    purchase_units?: { reference_id?: string; payments?: { captures?: { id: string; amount: { value: string; currency_code: string } }[] } }[];
  };
}
