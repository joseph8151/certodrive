import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeCustomerPrice } from "@/lib/pricing";
import { sendNotification } from "@/lib/notifications";
import { generateVoucherCode } from "@/lib/utils";
import bcrypt from "bcryptjs";

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

      // ---- Staff: register a driver on their behalf (auto-approved) ----
      case "CREATE_DRIVER": {
        const d = body.driver ?? {};
        const email = String(d.email ?? "").trim().toLowerCase();
        const contactName = String(d.contactName ?? "").trim();
        const country = String(d.country ?? "").trim();
        const city = String(d.city ?? "").trim();
        if (!email || !contactName || !country || !city) {
          return NextResponse.json({ error: "Email, name, country and city are required" }, { status: 400 });
        }
        if (await prisma.user.findUnique({ where: { email } })) {
          return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
        }
        // Split comma/newline separated lists into JSON arrays.
        const toArr = (s: unknown) =>
          String(s ?? "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
        const pw = await bcrypt.hash(String(d.password || "password123"), 10);
        const user = await prisma.user.create({
          data: { email, passwordHash: pw, role: "DRIVER", name: contactName, phone: d.phone || null },
        });
        const profile = await prisma.driverProfile.create({
          data: {
            userId: user.id,
            partnerType: d.partnerType === "COMPANY" ? "COMPANY" : "INDIVIDUAL",
            businessName: String(d.businessName || contactName).trim(),
            contactName,
            country,
            city,
            airports: JSON.stringify(toArr(d.airports)),
            serviceRegions: JSON.stringify(toArr(d.serviceRegions)),
            koreanLevel: d.koreanLevel || "NATIVE",
            englishLevel: d.englishLevel || "CONVERSATIONAL",
            settlementCurrency: String(d.settlementCurrency || "USD").toUpperCase(),
            baseSupplyPrice: d.baseSupplyPrice ? Number(d.baseSupplyPrice) : null,
            termsAgreed: true,
            approvalStatus: "APPROVED",
          },
        });
        if (d.vehicleCategory) {
          await prisma.vehicle.create({
            data: {
              driverProfileId: profile.id,
              category: String(d.vehicleCategory),
              makeModel: String(d.vehicleModel || "").trim() || "—",
              year: d.vehicleYear ? Number(d.vehicleYear) : null,
              maxPassengers: d.maxPassengers ? Number(d.maxPassengers) : 3,
              maxLuggage: d.maxLuggage ? Number(d.maxLuggage) : 3,
            },
          });
        }
        await audit(session.userId, "CREATE_DRIVER", "DriverProfile", profile.id, { email });
        return NextResponse.json({ ok: true, id: profile.id });
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

      // ---- Booking change requests ----
      case "APPLY_CHANGE": {
        const cr = await prisma.bookingChangeRequest.findUnique({ where: { id: body.changeId }, include: { booking: true } });
        if (!cr) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (cr.status !== "PENDING") return NextResponse.json({ error: "Already resolved" }, { status: 409 });
        const ALLOWED = ["serviceDate", "serviceTime", "pickupLocation", "destination", "passengers", "flightNumber"];
        const changes = JSON.parse(cr.changes) as Record<string, string | number>;
        const data: Record<string, string | number> = {};
        for (const k of ALLOWED) if (k in changes) data[k] = changes[k];
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: cr.bookingId },
            data: { ...data, statusEvents: { create: { from: cr.booking.status, to: cr.booking.status, actor: `admin:${session.userId}`, note: `Change applied: ${Object.keys(data).join(", ")}` } } },
          }),
          prisma.bookingChangeRequest.update({ where: { id: cr.id }, data: { status: "APPLIED", resolvedAt: new Date() } }),
        ]);
        await audit(session.userId, "APPLY_CHANGE", "Booking", cr.bookingId, data);
        await sendNotification({ template: "CHANGE_APPLIED", recipientType: "CUSTOMER", to: cr.booking.customerEmail, bookingId: cr.bookingId, context: { reference: cr.booking.reference, customerName: cr.booking.customerName } });
        return NextResponse.json({ ok: true });
      }
      case "REJECT_CHANGE": {
        await prisma.bookingChangeRequest.update({ where: { id: body.changeId }, data: { status: "REJECTED", resolvedAt: new Date() } });
        await audit(session.userId, "REJECT_CHANGE", "BookingChangeRequest", body.changeId);
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

      // ---- City landing CMS ----
      case "SAVE_CITY_CONTENT": {
        const c = body.content ?? {};
        const city = String(c.city ?? "").trim();
        if (!city) return NextResponse.json({ error: "City is required" }, { status: 400 });
        // FAQ arrives as "question | answer" lines; store as JSON.
        const faq = String(c.faqText ?? "")
          .split("\n").map((l: string) => l.trim()).filter(Boolean)
          .map((l: string) => { const [q, ...a] = l.split("|"); return { q: q.trim(), a: a.join("|").trim() }; })
          .filter((x: { q: string; a: string }) => x.q && x.a);
        const saved = await prisma.cityContent.upsert({
          where: { city },
          update: { country: c.country || null, headline: c.headline || null, intro: c.intro || null, faq: JSON.stringify(faq), metaTitle: c.metaTitle || null, metaDescription: c.metaDescription || null, published: c.published !== false },
          create: { city, country: c.country || null, headline: c.headline || null, intro: c.intro || null, faq: JSON.stringify(faq), metaTitle: c.metaTitle || null, metaDescription: c.metaDescription || null, published: c.published !== false },
        });
        await audit(session.userId, "SAVE_CITY_CONTENT", "CityContent", saved.id, { city });
        return NextResponse.json({ ok: true });
      }
      case "DELETE_CITY_CONTENT": {
        await prisma.cityContent.delete({ where: { id: body.contentId } });
        await audit(session.userId, "DELETE_CITY_CONTENT", "CityContent", body.contentId);
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
