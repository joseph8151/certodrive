import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeCustomerPrice } from "@/lib/pricing";
import { sendNotification } from "@/lib/notifications";
import { generateVoucherCode } from "@/lib/utils";

async function audit(actorId: string, action: string, entity: string, entityId: string, meta?: unknown) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, meta: meta ? JSON.stringify(meta) : null },
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const action: string = body?.action;

  try {
    switch (action) {
      // ---- Set / recompute the final customer price for a booking ----
      case "SET_PRICE": {
        const { bookingId, supplyPrice, tollAndParking, extraWaitingHours, isHoliday } = body;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const pricing = await computeCustomerPrice({
          supplyPrice: Number(supplyPrice),
          currency: booking.currency,
          country: booking.pickupCountry,
          city: booking.pickupCity,
          pickupLocation: booking.pickupLocation,
          destination: booking.destination,
          serviceDate: booking.serviceDate,
          serviceTime: booking.serviceTime,
          koreanDriverRequired: booking.koreanDriverRequired,
          childSeat: booking.childSeat,
          airportPicket: booking.airportPicket,
          tollAndParking: tollAndParking ? Number(tollAndParking) : 0,
          extraWaitingHours: extraWaitingHours ? Number(extraWaitingHours) : 0,
          isHoliday: !!isHoliday,
          discountAmount: booking.discountAmount,
        });

        const nextStatus =
          booking.status === "QUOTE_REQUESTED" || booking.status === "QUOTE_RECEIVED"
            ? "AWAITING_CUSTOMER_PAYMENT"
            : booking.status;

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            supplyPrice: pricing.supplyPrice,
            customerPrice: pricing.customerPrice,
            marginAmount: pricing.marginAmount,
            priceBreakdown: JSON.stringify(pricing.lineItems),
            status: nextStatus,
            statusEvents: nextStatus !== booking.status
              ? { create: { from: booking.status, to: nextStatus, actor: `admin:${session.userId}`, note: "Price set" } }
              : undefined,
          },
        });
        await audit(session.userId, "SET_PRICE", "Booking", bookingId, { supplyPrice, customerPrice: pricing.customerPrice });

        if (nextStatus === "AWAITING_CUSTOMER_PAYMENT") {
          await sendNotification({
            template: "PAYMENT_REQUEST",
            recipientType: "CUSTOMER",
            to: booking.customerEmail,
            bookingId,
            context: { reference: booking.reference, customerName: booking.customerName, amount: `${pricing.customerPrice} ${pricing.currency}`, route: `${booking.pickupLocation} → ${booking.destination}` },
          });
        }
        return NextResponse.json({ ok: true, customerPrice: pricing.customerPrice });
      }

      // ---- Assign a driver ----
      case "ASSIGN_DRIVER": {
        const { bookingId, driverProfileId } = body;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        const driver = await prisma.driverProfile.findUnique({ where: { id: driverProfileId }, include: { user: true } });
        if (!booking || !driver) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (!["PAYMENT_COMPLETED", "DRIVER_ASSIGNMENT_PENDING", "DRIVER_ASSIGNED"].includes(booking.status)) {
          return NextResponse.json({ error: `Cannot assign from ${booking.status}` }, { status: 409 });
        }

        // Prefer the driver's own offer as the supply price, if present.
        const offer = await prisma.driverQuote.findUnique({
          where: { bookingId_driverProfileId: { bookingId, driverProfileId } },
        });

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            assignedDriverId: driverProfileId,
            supplyPrice: offer?.supplyPrice ?? booking.supplyPrice ?? driver.baseSupplyPrice,
            status: "DRIVER_ASSIGNED",
            statusEvents: { create: { from: booking.status, to: "DRIVER_ASSIGNED", actor: `admin:${session.userId}`, note: `Assigned ${driver.contactName}` } },
          },
        });
        await audit(session.userId, "ASSIGN_DRIVER", "Booking", bookingId, { driverProfileId });

        const ctx = { reference: booking.reference, customerName: booking.customerName, driverName: driver.contactName, route: `${booking.pickupLocation} → ${booking.destination}`, dateTime: `${booking.serviceDate} ${booking.serviceTime}` };
        await sendNotification({ template: "DRIVER_ASSIGNED", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId, context: ctx });
        await sendNotification({ template: "DRIVER_ASSIGNED", recipientType: "DRIVER", to: driver.user.email, bookingId, context: ctx });
        return NextResponse.json({ ok: true });
      }

      // ---- Generate customer + driver vouchers ----
      case "GENERATE_VOUCHER": {
        const { bookingId } = body;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { vouchers: true } });
        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const created: string[] = [];
        for (const type of ["CUSTOMER", "DRIVER"] as const) {
          if (!booking.vouchers.some((v) => v.type === type)) {
            const v = await prisma.voucher.create({ data: { bookingId, type, code: generateVoucherCode() } });
            created.push(v.code);
          }
        }
        await audit(session.userId, "GENERATE_VOUCHER", "Booking", bookingId, { created });
        return NextResponse.json({ ok: true, created });
      }

      // ---- Cancel / refund ----
      case "CANCEL": {
        const { bookingId, refund } = body;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const to = refund ? "REFUNDED" : "CANCELLED";
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: to, statusEvents: { create: { from: booking.status, to, actor: `admin:${session.userId}` } } },
        });
        if (refund && booking.payment?.status === "COMPLETED") {
          await prisma.payment.update({ where: { bookingId }, data: { status: "REFUNDED", refundedAt: new Date() } });
        }
        await audit(session.userId, to, "Booking", bookingId);
        await sendNotification({ template: "CANCELLED_REFUND", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId, context: { reference: booking.reference, customerName: booking.customerName } });
        return NextResponse.json({ ok: true });
      }

      // ---- Confirm payment manually (e.g. bank transfer) ----
      case "CONFIRM_PAYMENT": {
        const { bookingId } = body;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.customerPrice == null) return NextResponse.json({ error: "No price" }, { status: 409 });
        await prisma.$transaction([
          prisma.payment.upsert({
            where: { bookingId },
            update: { status: "COMPLETED", paidAt: new Date(), amount: booking.customerPrice, currency: booking.currency },
            create: { bookingId, amount: booking.customerPrice, currency: booking.currency, method: "BANK_TRANSFER", status: "COMPLETED", paidAt: new Date() },
          }),
          prisma.booking.update({
            where: { id: bookingId },
            data: { status: "DRIVER_ASSIGNMENT_PENDING", statusEvents: { create: { from: booking.status, to: "DRIVER_ASSIGNMENT_PENDING", actor: `admin:${session.userId}`, note: "Payment confirmed manually" } } },
          }),
        ]);
        await audit(session.userId, "CONFIRM_PAYMENT", "Booking", bookingId);
        return NextResponse.json({ ok: true });
      }

      // ---- Approve / reject a driver ----
      case "DRIVER_APPROVAL": {
        const { driverProfileId, status } = body;
        if (!["APPROVED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) return NextResponse.json({ error: "Bad status" }, { status: 400 });
        await prisma.driverProfile.update({ where: { id: driverProfileId }, data: { approvalStatus: status } });
        await audit(session.userId, "DRIVER_APPROVAL", "DriverProfile", driverProfileId, { status });
        return NextResponse.json({ ok: true });
      }

      // ---- Mark a settlement paid ----
      case "SETTLE": {
        const { settlementId, note } = body;
        await prisma.settlement.update({ where: { id: settlementId }, data: { status: "PAID", paidAt: new Date(), note: note ?? null } });
        await audit(session.userId, "SETTLE", "Settlement", settlementId);
        return NextResponse.json({ ok: true });
      }

      // ---- Create / delete a price rule ----
      case "CREATE_PRICE_RULE": {
        const r = body.rule;
        const rule = await prisma.priceRule.create({
          data: {
            country: r.country, city: r.city, pickupLocation: r.pickupLocation, destination: r.destination,
            vehicleCategory: r.vehicleCategory, driverSupplyPrice: Number(r.driverSupplyPrice), currency: r.currency || "USD",
            estimatedMinutes: r.estimatedMinutes ? Number(r.estimatedMinutes) : null,
          },
        });
        await audit(session.userId, "CREATE_PRICE_RULE", "PriceRule", rule.id);
        return NextResponse.json({ ok: true, id: rule.id });
      }
      case "DELETE_PRICE_RULE": {
        await prisma.priceRule.delete({ where: { id: body.ruleId } });
        await audit(session.userId, "DELETE_PRICE_RULE", "PriceRule", body.ruleId);
        return NextResponse.json({ ok: true });
      }

      // ---- Promotions ----
      case "CREATE_PROMO": {
        const p = body.promo;
        const promo = await prisma.promotion.create({
          data: {
            code: String(p.code).trim().toUpperCase(),
            description: p.description || null,
            discountType: p.discountType === "FIXED" ? "FIXED" : "PERCENT",
            value: Number(p.value),
            maxUses: p.maxUses ? Number(p.maxUses) : null,
            expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
          },
        });
        await audit(session.userId, "CREATE_PROMO", "Promotion", promo.id);
        return NextResponse.json({ ok: true, id: promo.id });
      }
      case "TOGGLE_PROMO": {
        const promo = await prisma.promotion.findUnique({ where: { id: body.promoId } });
        if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.promotion.update({ where: { id: body.promoId }, data: { active: !promo.active } });
        await audit(session.userId, "TOGGLE_PROMO", "Promotion", body.promoId);
        return NextResponse.json({ ok: true });
      }
      case "DELETE_PROMO": {
        await prisma.promotion.delete({ where: { id: body.promoId } });
        await audit(session.userId, "DELETE_PROMO", "Promotion", body.promoId);
        return NextResponse.json({ ok: true });
      }

      // ---- Exchange rates ----
      case "UPSERT_RATE": {
        const { base, target, rate } = body;
        if (!base || !target || !rate) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        const r = await prisma.exchangeRate.upsert({
          where: { base_target: { base: String(base).toUpperCase(), target: String(target).toUpperCase() } },
          update: { rate: Number(rate) },
          create: { base: String(base).toUpperCase(), target: String(target).toUpperCase(), rate: Number(rate) },
        });
        await audit(session.userId, "UPSERT_RATE", "ExchangeRate", r.id);
        return NextResponse.json({ ok: true });
      }
      case "DELETE_RATE": {
        await prisma.exchangeRate.delete({ where: { id: body.rateId } });
        await audit(session.userId, "DELETE_RATE", "ExchangeRate", body.rateId);
        return NextResponse.json({ ok: true });
      }

      // ---- Flight delay notice ----
      case "FLIGHT_DELAY": {
        const { bookingId } = body;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const ctx = { reference: booking.reference, customerName: booking.customerName, route: `${booking.pickupLocation} → ${booking.destination}` };
        await sendNotification({ template: "FLIGHT_DELAY", recipientType: "CUSTOMER", to: booking.customerEmail, bookingId, context: ctx });
        if (booking.assignedDriverId) {
          const driver = await prisma.driverProfile.findUnique({ where: { id: booking.assignedDriverId }, include: { user: true } });
          if (driver) await sendNotification({ template: "FLIGHT_DELAY", recipientType: "DRIVER", to: driver.user.email, bookingId, context: ctx });
        }
        await audit(session.userId, "FLIGHT_DELAY", "Booking", bookingId);
        return NextResponse.json({ ok: true });
      }

      // ---- Inbox: inquiries & corporate applications ----
      case "RESOLVE_INQUIRY": {
        await prisma.inquiry.update({ where: { id: body.inquiryId }, data: { status: body.status === "OPEN" ? "OPEN" : "RESOLVED" } });
        await audit(session.userId, "RESOLVE_INQUIRY", "Inquiry", body.inquiryId);
        return NextResponse.json({ ok: true });
      }
      case "SET_CORPORATE_STATUS": {
        const status = ["PENDING", "ACTIVE", "REJECTED"].includes(body.status) ? body.status : "PENDING";
        await prisma.corporateAccount.update({ where: { id: body.corporateId }, data: { status } });
        await audit(session.userId, "SET_CORPORATE_STATUS", "CorporateAccount", body.corporateId, { status });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    console.error("admin action error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
