// Airport directory powering the /airport/[code] SEO landing pages.
// `citySlug` matches POPULAR_CITIES city names so the booking widget prefill
// and the /destinations/[city] link resolve cleanly.

export type AirportInfo = {
  code: string;
  name: { ko: string; en: string };
  citySlug: { ko: string; en: string };
  country: { ko: string; en: string };
  terminals: string[];
  meet: { ko: string; en: string };
  destinations: { ko: string; en: string }[];
};

export const AIRPORTS: Record<string, AirportInfo> = {
  ICN: {
    code: "ICN", name: { ko: "인천국제공항", en: "Incheon International" },
    citySlug: { ko: "서울", en: "Seoul" }, country: { ko: "대한민국", en: "South Korea" },
    terminals: ["T1", "T2"],
    meet: { ko: "입국장(1층) 게이트 앞에서 성함 피켓을 든 기사님을 만납니다. T1·T2 중 도착 터미널을 예약 시 알려주세요.", en: "Meet your driver holding a name board at the Arrivals gate (1F). Tell us your terminal (T1/T2) when booking." },
    destinations: [{ ko: "강남", en: "Gangnam" }, { ko: "명동·중구", en: "Myeongdong" }, { ko: "홍대", en: "Hongdae" }, { ko: "잠실", en: "Jamsil" }],
  },
  GMP: {
    code: "GMP", name: { ko: "김포국제공항", en: "Gimpo International" },
    citySlug: { ko: "서울", en: "Seoul" }, country: { ko: "대한민국", en: "South Korea" },
    terminals: [], meet: { ko: "국제선 입국장 앞에서 피켓으로 만납니다.", en: "Meet at the international arrivals hall with a name board." },
    destinations: [{ ko: "강남", en: "Gangnam" }, { ko: "여의도", en: "Yeouido" }, { ko: "김포·마곡", en: "Magok" }],
  },
  NRT: {
    code: "NRT", name: { ko: "나리타국제공항", en: "Narita International" },
    citySlug: { ko: "도쿄", en: "Tokyo" }, country: { ko: "일본", en: "Japan" },
    terminals: ["T1", "T2", "T3"], meet: { ko: "도착 로비에서 피켓을 든 기사님을 만납니다. 도쿄 시내까지 약 60~90분.", en: "Meet at the arrivals lobby; roughly 60–90 min into central Tokyo." },
    destinations: [{ ko: "신주쿠", en: "Shinjuku" }, { ko: "시부야", en: "Shibuya" }, { ko: "긴자", en: "Ginza" }, { ko: "디즈니", en: "Disney" }],
  },
  HND: {
    code: "HND", name: { ko: "하네다공항", en: "Haneda" },
    citySlug: { ko: "도쿄", en: "Tokyo" }, country: { ko: "일본", en: "Japan" },
    terminals: ["T3 (국제선)"], meet: { ko: "국제선(제3터미널) 도착 로비에서 만납니다. 시내까지 약 30~45분.", en: "Meet at the international (T3) arrivals lobby; ~30–45 min to the city." },
    destinations: [{ ko: "시부야", en: "Shibuya" }, { ko: "롯폰기", en: "Roppongi" }, { ko: "신주쿠", en: "Shinjuku" }],
  },
  CDG: {
    code: "CDG", name: { ko: "샤를드골공항", en: "Charles de Gaulle" },
    citySlug: { ko: "파리", en: "Paris" }, country: { ko: "프랑스", en: "France" },
    terminals: ["T1", "T2", "T3"], meet: { ko: "도착 게이트 앞에서 피켓으로 만납니다. 파리 시내까지 약 45~60분.", en: "Meet at the arrivals gate with a name board; ~45–60 min into Paris." },
    destinations: [{ ko: "파리 8구", en: "Paris 8e" }, { ko: "에펠탑", en: "Eiffel Tower" }, { ko: "루브르", en: "Louvre" }, { ko: "디즈니", en: "Disneyland" }],
  },
  ORY: {
    code: "ORY", name: { ko: "오를리공항", en: "Orly" },
    citySlug: { ko: "파리", en: "Paris" }, country: { ko: "프랑스", en: "France" },
    terminals: ["Orly 1-4"], meet: { ko: "도착 홀에서 피켓으로 만납니다. 시내까지 약 30~45분.", en: "Meet in the arrivals hall; ~30–45 min to the city." },
    destinations: [{ ko: "파리 시내", en: "Central Paris" }, { ko: "베르사유", en: "Versailles" }],
  },
  LHR: {
    code: "LHR", name: { ko: "히드로공항", en: "Heathrow" },
    citySlug: { ko: "런던", en: "London" }, country: { ko: "영국", en: "UK" },
    terminals: ["T2", "T3", "T4", "T5"], meet: { ko: "도착 터미널 미팅 포인트에서 피켓으로 만납니다.", en: "Meet at the arrivals meeting point of your terminal." },
    destinations: [{ ko: "런던 시내", en: "Central London" }, { ko: "메이페어", en: "Mayfair" }, { ko: "카나리워프", en: "Canary Wharf" }],
  },
  LGW: {
    code: "LGW", name: { ko: "개트윅공항", en: "Gatwick" },
    citySlug: { ko: "런던", en: "London" }, country: { ko: "영국", en: "UK" },
    terminals: ["North", "South"], meet: { ko: "도착 홀에서 피켓으로 만납니다.", en: "Meet in the arrivals hall with a name board." },
    destinations: [{ ko: "런던 시내", en: "Central London" }, { ko: "브라이튼", en: "Brighton" }],
  },
  JFK: {
    code: "JFK", name: { ko: "존 F. 케네디공항", en: "John F. Kennedy" },
    citySlug: { ko: "뉴욕", en: "New York" }, country: { ko: "미국", en: "USA" },
    terminals: ["T1", "T4", "T5", "T7", "T8"], meet: { ko: "도착 터미널 배기지 클레임 근처에서 피켓으로 만납니다. 맨해튼까지 약 45~75분.", en: "Meet near baggage claim in your terminal; ~45–75 min to Manhattan." },
    destinations: [{ ko: "맨해튼", en: "Manhattan" }, { ko: "브루클린", en: "Brooklyn" }, { ko: "뉴어크", en: "Newark" }],
  },
  EWR: {
    code: "EWR", name: { ko: "뉴어크공항", en: "Newark Liberty" },
    citySlug: { ko: "뉴욕", en: "New York" }, country: { ko: "미국", en: "USA" },
    terminals: ["A", "B", "C"], meet: { ko: "도착 터미널에서 피켓으로 만납니다. 맨해튼까지 약 40~70분.", en: "Meet in your arrivals terminal; ~40–70 min to Manhattan." },
    destinations: [{ ko: "맨해튼", en: "Manhattan" }, { ko: "저지시티", en: "Jersey City" }],
  },
  FCO: {
    code: "FCO", name: { ko: "피우미치노공항", en: "Fiumicino (Leonardo da Vinci)" },
    citySlug: { ko: "로마", en: "Rome" }, country: { ko: "이탈리아", en: "Italy" },
    terminals: ["T1", "T3"], meet: { ko: "도착 홀에서 피켓으로 만납니다. 로마 시내까지 약 45~60분.", en: "Meet in the arrivals hall; ~45–60 min into Rome." },
    destinations: [{ ko: "로마 시내", en: "Central Rome" }, { ko: "바티칸", en: "Vatican" }, { ko: "치비타베키아 항구", en: "Civitavecchia port" }],
  },
  BCN: {
    code: "BCN", name: { ko: "바르셀로나 엘프라트공항", en: "Barcelona El Prat" },
    citySlug: { ko: "바르셀로나", en: "Barcelona" }, country: { ko: "스페인", en: "Spain" },
    terminals: ["T1", "T2"], meet: { ko: "도착 홀에서 피켓으로 만납니다. 시내까지 약 25~40분.", en: "Meet in the arrivals hall; ~25–40 min to the city." },
    destinations: [{ ko: "바르셀로나 시내", en: "Central Barcelona" }, { ko: "사그라다 파밀리아", en: "Sagrada Família" }],
  },
};

export const AIRPORT_CODES = Object.keys(AIRPORTS);
