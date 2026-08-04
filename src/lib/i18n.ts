// Lightweight i18n. Locale is stored in the `cd_locale` cookie (default: ko).
// Dictionary is a flat key → { ko, en } map; `t(dict, key)` resolves it.

export type Locale = "ko" | "en";

export const dict = {
  // Global / nav
  "brand.tagline": { ko: "해외에서 만나는 검증된 한인 기사 — 공항 픽업·한인 택시·하루 종일 전세", en: "Verified Korean chauffeurs abroad — airport transfers, Korean taxi & full-day hire" },
  "nav.pickup": { ko: "공항 픽업", en: "Airport Pickup" },
  "nav.dropoff": { ko: "공항 샌딩", en: "Airport Drop-off" },
  "nav.intercity": { ko: "도시 간 이동", en: "Intercity" },
  "nav.hourly": { ko: "시간제 차량", en: "Hourly Hire" },
  "nav.vip": { ko: "VIP·기업 의전", en: "VIP & Corporate" },
  "nav.cities": { ko: "서비스 지역", en: "Destinations" },
  "nav.help": { ko: "이용안내", en: "How it works" },
  "nav.lookup": { ko: "예약 조회", en: "Manage booking" },
  "nav.driver": { ko: "기사 파트너", en: "Drive with us" },
  "nav.login": { ko: "로그인", en: "Sign in" },
  "nav.book": { ko: "예약하기", en: "Book now" },

  // Hero
  "hero.title": { ko: "해외에서 만나는 한인 기사\n공항 픽업부터 하루 종일 전세까지", en: "Your Korean chauffeur abroad —\nfrom airport pickup to full-day hire" },
  "hero.subtitle": { ko: "해외여행·출장 중 한국어가 통하는 검증된 한인 기사를 예약하세요. 공항 픽업·샌딩은 물론, 도시 간 이동과 하루 종일 기사·차량 전세까지. 정찰제 요금, 출발 전 기사 확정, 24시간 한국어 지원.", en: "Book a verified Korean-speaking chauffeur while you travel abroad. Airport pickup & drop-off, intercity rides, and full-day driver + vehicle hire. Fixed pricing, driver confirmed before departure, 24/7 Korean support." },

  // Booking widget
  "book.title": { ko: "차량 예약", en: "Book your ride" },
  "book.oneway": { ko: "편도", en: "One way" },
  "book.roundtrip": { ko: "왕복", en: "Round trip" },
  "book.service": { ko: "서비스 종류", en: "Service" },
  "book.country": { ko: "픽업 국가", en: "Pickup country" },
  "book.city": { ko: "픽업 도시", en: "Pickup city" },
  "book.pickup": { ko: "픽업 장소 / 공항", en: "Pickup location / airport" },
  "book.destination": { ko: "목적지 주소", en: "Destination address" },
  "book.date": { ko: "이용 날짜", en: "Date" },
  "book.time": { ko: "이용 시간", en: "Time" },
  "book.returnDate": { ko: "돌아오는 날짜", en: "Return date" },
  "book.returnTime": { ko: "돌아오는 시간", en: "Return time" },
  "book.flight": { ko: "항공편 번호", en: "Flight number" },
  "book.passengers": { ko: "승객 수", en: "Passengers" },
  "book.adults": { ko: "성인", en: "Adults" },
  "book.children": { ko: "어린이", en: "Children" },
  "book.luggage": { ko: "수하물 수", en: "Luggage" },
  "book.vehicle": { ko: "차량 종류", en: "Vehicle class" },
  "book.hours": { ko: "이용 시간(시간)", en: "Duration (hours)" },
  "book.korean": { ko: "한국어 가능 기사 필수", en: "Korean-speaking driver required" },
  "book.childseat": { ko: "카시트 필요", en: "Child seat" },
  "book.picket": { ko: "공항 피켓 미팅", en: "Airport meet & greet (name board)" },
  "book.name": { ko: "고객 이름", en: "Full name" },
  "book.email": { ko: "이메일", en: "Email" },
  "book.phone": { ko: "전화번호", en: "Phone number" },
  "book.messenger": { ko: "카카오톡 / WhatsApp", en: "KakaoTalk / WhatsApp" },
  "book.special": { ko: "특별 요청", en: "Special requests" },
  "book.getPrice": { ko: "가격 확인 및 예약", en: "Get price & book" },
  "book.next": { ko: "다음", en: "Continue" },
  "book.back": { ko: "이전", en: "Back" },
  "book.step1": { ko: "이동 정보", en: "Trip details" },
  "book.step2": { ko: "차량 및 옵션", en: "Vehicle & options" },
  "book.step3": { ko: "예약자 정보", en: "Your details" },
  "book.selectPlaceholder": { ko: "선택하세요", en: "Select" },

  // Value props
  "value.title": { ko: "왜 Certo Drive인가", en: "Why Certo Drive" },
  "value.verified": { ko: "검증된 한인·한국어 기사", en: "Verified Korean-speaking drivers" },
  "value.verified.d": { ko: "면허·보험·차량 서류를 검증한 파트너 기사만 배정합니다.", en: "Only partners whose license, insurance and vehicle documents are verified." },
  "value.confirmed": { ko: "출발 전 기사 확정", en: "Driver confirmed before you fly" },
  "value.confirmed.d": { ko: "현장 배차가 아닙니다. 이용 전에 담당 기사가 확정됩니다.", en: "No on-street dispatch. Your chauffeur is confirmed ahead of time." },
  "value.fixed": { ko: "숨겨진 비용 없는 정찰제", en: "Fixed price, no hidden fees" },
  "value.fixed.d": { ko: "톨게이트·대기·피켓까지 포함한 최종 가격을 먼저 확인합니다.", en: "The all-in price — tolls, waiting, meet & greet — shown upfront." },
  "value.flight": { ko: "항공편 지연 확인", en: "Flight delay monitoring" },
  "value.flight.d": { ko: "항공편 번호로 도착 시간을 확인해 대기합니다.", en: "We track your flight and adjust pickup time at no extra cost." },
  "value.meet": { ko: "공항 미팅·피켓 서비스", en: "Airport meet & greet" },
  "value.meet.d": { ko: "입국장에서 이름 피켓으로 안내해 드립니다.", en: "Your driver waits at arrivals with a name board." },
  "value.support": { ko: "한국어 고객지원", en: "Korean customer support" },
  "value.support.d": { ko: "문제가 생기면 Certo Drive가 중간에서 직접 대응합니다.", en: "If anything goes wrong, Certo Drive steps in directly." },

  // How it works
  "how.title": { ko: "이용 방법", en: "How it works" },
  "how.1": { ko: "이동 정보를 입력합니다", en: "Tell us your trip" },
  "how.1d": { ko: "등록된 노선은 즉시 가격이 표시되고, 그 외 지역은 견적으로 접수됩니다.", en: "Registered routes show an instant price; other areas are handled as a quote." },
  "how.2": { ko: "기사 확정 및 결제", en: "Driver confirmed & payment" },
  "how.2d": { ko: "검증된 기사를 확정하고 최종 가격으로 안전하게 선결제합니다.", en: "We confirm a verified driver and you prepay securely at the final price." },
  "how.3": { ko: "바우처 발송", en: "Voucher issued" },
  "how.3d": { ko: "예약 바우처와 기사 정보를 이메일로 받아보세요.", en: "Receive your booking voucher and driver details by email." },
  "how.4": { ko: "공항에서 미팅", en: "Meet at the airport" },
  "how.4d": { ko: "기사님이 피켓을 들고 입국장에서 기다립니다.", en: "Your chauffeur meets you at arrivals with a name board." },

  // Fleet
  "fleet.title": { ko: "차량 클래스", en: "Our fleet" },
  "fleet.pax": { ko: "인승", en: "pax" },
  "fleet.bags": { ko: "수하물", en: "bags" },

  // Footer & misc
  "footer.company": { ko: "회사 소개", en: "Company" },
  "footer.legal": { ko: "약관·정책", en: "Legal" },
  "footer.partners": { ko: "파트너", en: "Partners" },
  "footer.terms": { ko: "이용약관", en: "Terms" },
  "footer.cancel": { ko: "취소·환불 규정", en: "Cancellation & refunds" },
  "footer.privacy": { ko: "개인정보 처리방침", en: "Privacy policy" },
  "footer.corporate": { ko: "기업·여행사 제휴", en: "Corporate & agency" },
  "footer.support": { ko: "고객센터", en: "Support" },
  "footer.rights": { ko: "모든 권리 보유.", en: "All rights reserved." },

  "cta.title": { ko: "다음 여행, 공항에서부터 편안하게", en: "Start your next trip the moment you land" },
  "cta.sub": { ko: "지금 예약하고 검증된 기사와 함께하세요.", en: "Book now and travel with a verified chauffeur." },

  "common.loading": { ko: "처리 중...", en: "Processing..." },
  "common.required": { ko: "필수", en: "required" },
  "common.optional": { ko: "선택", en: "optional" },
} as const;

export type DictKey = keyof typeof dict;

export function t(locale: Locale, key: DictKey): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[locale] ?? entry.ko;
}

export function makeT(locale: Locale) {
  return (key: DictKey) => t(locale, key);
}
