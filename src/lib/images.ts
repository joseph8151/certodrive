// Photography for the marketing surfaces. Referenced as CSS background images
// layered UNDER a navy gradient + navy background color, so a slow or missing
// photo degrades gracefully to an elegant solid rather than a broken image.

// auto=format serves AVIF/WebP per the browser's Accept header; compress trims
// bytes further. Widths are sized to how the image is actually used (photos sit
// under dark scrims, so slightly lower quality is invisible) to keep mobile light.
const u = (id: string, w = 1100) =>
  `https://images.unsplash.com/photo-${id}?auto=format,compress&fit=crop&w=${w}&q=68`;

export const IMG = {
  hero: u("1503376780353-7e6692767b70", 1600), // sleek car, dusk road
  editorial: u("1449965408869-eaa3f722e40d", 1400), // classic luxury car
  vipBand: u("1511919884226-fd3cad34687c", 1400), // chauffeur / executive
  airport: u("1436491865332-7a61a109cc05", 1400), // airplane / travel
  meet: u("1560250097-0b93528c311a", 1200), // suited chauffeur / executive
  reviews: u("1520340356584-f9917d1eb98a", 1400), // scenic road trip
  family: u("1502920917128-1aa500764cbd", 1200), // travel / arrival
};

// City → photo. Both Korean and English names map to the same image.
// City cards render small (a 4-up grid), so 900px is ample.
const c = (id: string) => u(id, 900);
export const CITY_IMG: Record<string, string> = {
  "서울": c("1517154421773-0529f29ea451"), Seoul: c("1517154421773-0529f29ea451"),
  "도쿄": c("1540959733332-eab4deabeeaf"), Tokyo: c("1540959733332-eab4deabeeaf"),
  "파리": c("1502602898657-3e91760cbb34"), Paris: c("1502602898657-3e91760cbb34"),
  "런던": c("1513635269975-59663e0ac1ad"), London: c("1513635269975-59663e0ac1ad"),
  "뉴욕": c("1496442226666-8d4d0e62e6e9"), "New York": c("1496442226666-8d4d0e62e6e9"),
  "로마": c("1552832230-c0197dd311b5"), Rome: c("1552832230-c0197dd311b5"),
  "바르셀로나": c("1583422409516-2895a77efded"), Barcelona: c("1583422409516-2895a77efded"),
  "방콕": c("1508009603885-50cf7c579365"), Bangkok: c("1508009603885-50cf7c579365"),
};

export function cityImage(city: string): string {
  return CITY_IMG[city] ?? IMG.editorial;
}
