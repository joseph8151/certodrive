// Photography for the marketing surfaces. Referenced as CSS background images
// layered UNDER a navy gradient + navy background color, so a slow or missing
// photo degrades gracefully to an elegant solid rather than a broken image.

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  hero: u("1503376780353-7e6692767b70", 2000), // sleek car, dusk road
  editorial: u("1449965408869-eaa3f722e40d", 2000), // classic luxury car
  vipBand: u("1511919884226-fd3cad34687c", 2000), // chauffeur / executive
  airport: u("1436491865332-7a61a109cc05", 2000), // airplane / travel
  meet: u("1560250097-0b93528c311a", 1600), // suited chauffeur / executive
  reviews: u("1520340356584-f9917d1eb98a", 2000), // scenic road trip
  family: u("1502920917128-1aa500764cbd", 1600), // travel / arrival
};

// City → photo. Both Korean and English names map to the same image.
export const CITY_IMG: Record<string, string> = {
  "서울": u("1517154421773-0529f29ea451"), Seoul: u("1517154421773-0529f29ea451"),
  "도쿄": u("1540959733332-eab4deabeeaf"), Tokyo: u("1540959733332-eab4deabeeaf"),
  "파리": u("1502602898657-3e91760cbb34"), Paris: u("1502602898657-3e91760cbb34"),
  "런던": u("1513635269975-59663e0ac1ad"), London: u("1513635269975-59663e0ac1ad"),
  "뉴욕": u("1496442226666-8d4d0e62e6e9"), "New York": u("1496442226666-8d4d0e62e6e9"),
  "로마": u("1552832230-c0197dd311b5"), Rome: u("1552832230-c0197dd311b5"),
  "바르셀로나": u("1583422409516-2895a77efded"), Barcelona: u("1583422409516-2895a77efded"),
  "방콕": u("1508009603885-50cf7c579365"), Bangkok: u("1508009603885-50cf7c579365"),
};

export function cityImage(city: string): string {
  return CITY_IMG[city] ?? IMG.editorial;
}
