import { prisma } from "./db";

// ---------------------------------------------------------------------------
// Notification module.
//
// For the MVP there is no live SMTP / KakaoTalk / WhatsApp transport, so every
// message is rendered from a template and persisted to the Notification table
// (visible in the admin dashboard) and logged to the server console. Swapping
// in a real transport later is a single function change in `deliver()`.
// ---------------------------------------------------------------------------

export type NotificationTemplate =
  | "QUOTE_REQUESTED"
  | "QUOTE_RECEIVED"
  | "PAYMENT_REQUEST"
  | "PAYMENT_COMPLETED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_INFO"
  | "DAY_BEFORE_REMINDER"
  | "FLIGHT_DELAY"
  | "DRIVER_ARRIVED"
  | "TRIP_COMPLETED"
  | "REVIEW_REQUEST"
  | "CANCELLED_REFUND"
  | "CHANGE_REQUESTED"
  | "CHANGE_APPLIED"
  | "NEW_BOOKING_REQUEST"; // to driver

interface TemplateContext {
  reference?: string;
  customerName?: string;
  driverName?: string;
  amount?: string;
  route?: string;
  dateTime?: string;
  [key: string]: string | undefined;
}

const TEMPLATES: Record<
  NotificationTemplate,
  (c: TemplateContext) => { subject: string; body: string }
> = {
  QUOTE_REQUESTED: (c) => ({
    subject: `[Certo Drive] 견적 요청이 접수되었습니다 (${c.reference})`,
    body: `${c.customerName}님, ${c.route} 이동 견적 요청이 접수되었습니다. 담당 매니저가 검증된 기사 파트너에게 확인 후 최종 가격을 안내드립니다.`,
  }),
  QUOTE_RECEIVED: (c) => ({
    subject: `[Certo Drive] 견적이 준비되었습니다 (${c.reference})`,
    body: `${c.customerName}님, 요청하신 ${c.route} 이동의 최종 가격은 ${c.amount} 입니다. 예약 조회 페이지에서 결제를 진행해 주세요.`,
  }),
  PAYMENT_REQUEST: (c) => ({
    subject: `[Certo Drive] 결제를 완료해 주세요 (${c.reference})`,
    body: `${c.customerName}님, 예약 확정을 위해 ${c.amount} 결제를 진행해 주세요. 결제 후 기사 배정이 시작됩니다.`,
  }),
  PAYMENT_COMPLETED: (c) => ({
    subject: `[Certo Drive] 결제가 완료되었습니다 (${c.reference})`,
    body: `${c.customerName}님, ${c.amount} 결제가 완료되었습니다. 곧 검증된 기사를 배정해 안내드리겠습니다.`,
  }),
  DRIVER_ASSIGNED: (c) => ({
    subject: `[Certo Drive] 기사님이 배정되었습니다 (${c.reference})`,
    body: `${c.customerName}님, ${c.dateTime} ${c.route} 이동에 ${c.driverName} 기사님이 배정되었습니다.`,
  }),
  DRIVER_INFO: (c) => ({
    subject: `[Certo Drive] 담당 기사 정보 안내 (${c.reference})`,
    body: `배정된 기사님 정보와 차량 정보를 안내드립니다. 공항에서 피켓으로 안내해 드립니다.`,
  }),
  DAY_BEFORE_REMINDER: (c) => ({
    subject: `[Certo Drive] 내일 이용 예정 안내 (${c.reference})`,
    body: `${c.customerName}님, 내일 ${c.dateTime} ${c.route} 이동이 예정되어 있습니다. 항공편 정보를 다시 한번 확인해 주세요.`,
  }),
  FLIGHT_DELAY: (c) => ({
    subject: `[Certo Drive] 항공편 지연 확인 안내 (${c.reference})`,
    body: `항공편 지연이 확인되었습니다. 기사님이 도착 시간에 맞춰 대기합니다. 추가 요금은 발생하지 않습니다.`,
  }),
  DRIVER_ARRIVED: (c) => ({
    subject: `[Certo Drive] 기사님이 도착했습니다 (${c.reference})`,
    body: `기사님이 미팅 장소에 도착했습니다. 피켓을 확인해 주세요.`,
  }),
  TRIP_COMPLETED: (c) => ({
    subject: `[Certo Drive] 운행이 완료되었습니다 (${c.reference})`,
    body: `${c.customerName}님, 안전하게 도착하셨길 바랍니다. Certo Drive를 이용해 주셔서 감사합니다.`,
  }),
  REVIEW_REQUEST: (c) => ({
    subject: `[Certo Drive] 이용 후기를 남겨주세요 (${c.reference})`,
    body: `이번 이용은 어떠셨나요? 소중한 후기를 남겨주시면 서비스 개선에 큰 도움이 됩니다.`,
  }),
  CANCELLED_REFUND: (c) => ({
    subject: `[Certo Drive] 취소 및 환불 안내 (${c.reference})`,
    body: `${c.customerName}님, 예약이 취소되었습니다. 환불 규정에 따라 처리해 드리겠습니다.`,
  }),
  CHANGE_REQUESTED: (c) => ({
    subject: `[Certo Drive] 예약 변경 요청이 접수되었습니다 (${c.reference})`,
    body: `${c.customerName}님, ${c.route} 예약의 변경 요청이 접수되었습니다. 담당 매니저가 확인 후 반영 여부를 안내드립니다.`,
  }),
  CHANGE_APPLIED: (c) => ({
    subject: `[Certo Drive] 예약이 변경되었습니다 (${c.reference})`,
    body: `${c.customerName}님, 요청하신 변경 사항이 예약에 반영되었습니다. 예약 조회에서 확인해 주세요.`,
  }),
  NEW_BOOKING_REQUEST: (c) => ({
    subject: `[Certo Drive Partner] 신규 예약 요청 (${c.reference})`,
    body: `${c.driverName}님, ${c.dateTime} ${c.route} 신규 예약 요청이 도착했습니다. 파트너 대시보드에서 가능 여부와 공급 가격을 제출해 주세요.`,
  }),
};

export async function sendNotification(opts: {
  template: NotificationTemplate;
  recipientType: "CUSTOMER" | "DRIVER" | "ADMIN";
  channel?: "EMAIL" | "KAKAO" | "WHATSAPP";
  to: string;
  bookingId?: string;
  context?: TemplateContext;
}) {
  const rendered = TEMPLATES[opts.template](opts.context ?? {});
  const channel = opts.channel ?? "EMAIL";

  // Real transport hook would go here (SMTP / KakaoTalk BizMessage / WhatsApp).
  // eslint-disable-next-line no-console
  console.log(`[notify:${channel}→${opts.to}] ${rendered.subject}`);

  return prisma.notification.create({
    data: {
      bookingId: opts.bookingId,
      recipientType: opts.recipientType,
      channel,
      template: opts.template,
      to: opts.to,
      subject: rendered.subject,
      body: rendered.body,
      status: "SENT",
    },
  });
}
