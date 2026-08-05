import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";
import { generateVoucherCode } from "@/lib/utils";

// Which payment gateways are configured (by env). The UI shows only enabled
// methods; the manual/bank option is always available so the platform is
// operable even before any gateway keys are added.
export function paymentConfig() {
  return {
    paypal: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET,
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "",
    portone:
      !!process.env.PORTONE_API_SECRET &&
      !!process.env.NEXT_PUBLIC_PORTONE_STORE_ID &&
      !!process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
    portoneStoreId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "",
    portoneChannelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "",
    // Allow the simulated flow only when no real gateway is set OR explicitly enabled.
    allowManual: process.env.ENABLE_MANUAL_PAYMENT === "1" || (!process.env.PAYPAL_CLIENT_ID && !process.env.PORTONE_API_SECRET),
  };
}

export type ConfirmResult =
  | { ok: true; status: string }
  | { ok: false; error: string; code: number };

// Idempotent-ish: marks a booking paid, records the payment, issues the
// customer voucher and moves it into the dispatch queue. Shared by every
// gateway (PayPal, PortOne/Korean, manual) so the post-payment flow is
// identical regardless of method.
export async function confirmBookingPayment(opts: {
  reference: string;
  method: string;
  transactionRef?: string;
  paidAmount?: number;
  paidCurrency?: string;
}): Promise<ConfirmResult> {
  const { reference, method } = opts;
  const booking = await prisma.booking.findUnique({ where: { reference }, include: { payment: true } });
  if (!booking) return { ok: false, error: "Booking not found", code: 404 };
  if (booking.payment?.status === "COMPLETED") return { ok: true, status: booking.status };
  if (booking.status !== "AWAITING_CUSTOMER_PAYMENT") return { ok: false, error: "Booking is not awaiting payment", code: 409 };
  if (booking.customerPrice == null) return { ok: false, error: "No price set", code: 409 };

  // If the gateway reported an amount, sanity-check it against the expected price.
  if (opts.paidAmount != null) {
    const expected = booking.customerPrice;
    // allow tiny rounding differences
    if (Math.abs(opts.paidAmount - expected) > Math.max(1, expected * 0.02)) {
      return { ok: false, error: `Paid amount ${opts.paidAmount} does not match expected ${expected}`, code: 409 };
    }
  }

  const route = `${booking.pickupLocation} → ${booking.destination}`;
  await prisma.$transaction([
    prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { status: "COMPLETED", method, amount: booking.customerPrice, currency: booking.currency, paidAt: new Date(), transactionRef: opts.transactionRef ?? null },
      create: {
        bookingId: booking.id, amount: booking.customerPrice, currency: booking.currency, method,
        status: "COMPLETED", paidAt: new Date(), transactionRef: opts.transactionRef ?? null,
      },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "DRIVER_ASSIGNMENT_PENDING",
        statusEvents: {
          create: [
            { from: booking.status, to: "PAYMENT_COMPLETED", actor: "customer", note: `Paid via ${method}` },
            { from: "PAYMENT_COMPLETED", to: "DRIVER_ASSIGNMENT_PENDING", actor: "system" },
          ],
        },
      },
    }),
    prisma.voucher.create({ data: { bookingId: booking.id, type: "CUSTOMER", code: generateVoucherCode() } }),
  ]);

  await sendNotification({
    template: "PAYMENT_COMPLETED",
    recipientType: "CUSTOMER",
    to: booking.customerEmail,
    bookingId: booking.id,
    context: { reference, customerName: booking.customerName, route, amount: `${booking.customerPrice} ${booking.currency}` },
  });

  return { ok: true, status: "DRIVER_ASSIGNMENT_PENDING" };
}
