/**
 * Fixture REAL del Mundial 2026 — fase de grupos (72 partidos).
 *
 * Fuentes: sorteo oficial FIFA (5-dic-2025) y calendario por grupo de
 * Wikipedia (en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A ... _L),
 * consultado el 11-jun-2026.
 *
 * Las horas están en HORA LOCAL de cada sede; kickoffUTC() las convierte a
 * UTC usando el offset de junio 2026 (EE.UU./Canadá con horario de verano,
 * México sin horario de verano).
 */

export type FixtureTeam = { name: string; code: string; group: string };

export type FixtureMatch = {
  group: string;
  a: string; // código FIFA equipo 1
  b: string; // código FIFA equipo 2
  date: string; // YYYY-MM-DD (local)
  time: string; // HH:MM (local)
  city: string;
  stadium: string;
  scoreA?: number; // solo si ya se jugó
  scoreB?: number;
};

// Los 48 clasificados con su grupo real
export const TEAMS_2026: FixtureTeam[] = [
  // Grupo A
  { name: "México", code: "MEX", group: "A" },
  { name: "Sudáfrica", code: "RSA", group: "A" },
  { name: "Corea del Sur", code: "KOR", group: "A" },
  { name: "Chequia", code: "CZE", group: "A" },
  // Grupo B
  { name: "Canadá", code: "CAN", group: "B" },
  { name: "Suiza", code: "SUI", group: "B" },
  { name: "Catar", code: "QAT", group: "B" },
  { name: "Bosnia y Herzegovina", code: "BIH", group: "B" },
  // Grupo C
  { name: "Brasil", code: "BRA", group: "C" },
  { name: "Marruecos", code: "MAR", group: "C" },
  { name: "Haití", code: "HAI", group: "C" },
  { name: "Escocia", code: "SCO", group: "C" },
  // Grupo D
  { name: "Estados Unidos", code: "USA", group: "D" },
  { name: "Paraguay", code: "PAR", group: "D" },
  { name: "Australia", code: "AUS", group: "D" },
  { name: "Turquía", code: "TUR", group: "D" },
  // Grupo E
  { name: "Alemania", code: "GER", group: "E" },
  { name: "Curazao", code: "CUW", group: "E" },
  { name: "Costa de Marfil", code: "CIV", group: "E" },
  { name: "Ecuador", code: "ECU", group: "E" },
  // Grupo F
  { name: "Países Bajos", code: "NED", group: "F" },
  { name: "Japón", code: "JPN", group: "F" },
  { name: "Túnez", code: "TUN", group: "F" },
  { name: "Suecia", code: "SWE", group: "F" },
  // Grupo G
  { name: "Bélgica", code: "BEL", group: "G" },
  { name: "Egipto", code: "EGY", group: "G" },
  { name: "Irán", code: "IRN", group: "G" },
  { name: "Nueva Zelanda", code: "NZL", group: "G" },
  // Grupo H
  { name: "España", code: "ESP", group: "H" },
  { name: "Cabo Verde", code: "CPV", group: "H" },
  { name: "Arabia Saudita", code: "KSA", group: "H" },
  { name: "Uruguay", code: "URU", group: "H" },
  // Grupo I
  { name: "Francia", code: "FRA", group: "I" },
  { name: "Senegal", code: "SEN", group: "I" },
  { name: "Noruega", code: "NOR", group: "I" },
  { name: "Irak", code: "IRQ", group: "I" },
  // Grupo J
  { name: "Argentina", code: "ARG", group: "J" },
  { name: "Argelia", code: "ALG", group: "J" },
  { name: "Austria", code: "AUT", group: "J" },
  { name: "Jordania", code: "JOR", group: "J" },
  // Grupo K
  { name: "Portugal", code: "POR", group: "K" },
  { name: "Colombia", code: "COL", group: "K" },
  { name: "Uzbekistán", code: "UZB", group: "K" },
  { name: "RD Congo", code: "COD", group: "K" },
  // Grupo L
  { name: "Inglaterra", code: "ENG", group: "L" },
  { name: "Croacia", code: "CRO", group: "L" },
  { name: "Ghana", code: "GHA", group: "L" },
  { name: "Panamá", code: "PAN", group: "L" },
];

// Horas que cada sede está DETRÁS de UTC en junio de 2026
export const CITY_UTC_OFFSET: Record<string, number> = {
  "Ciudad de México": 6,
  Zapopan: 6,
  Guadalupe: 6,
  Atlanta: 4,
  Toronto: 4,
  "East Rutherford": 4,
  Foxborough: 4,
  Filadelfia: 4,
  "Miami Gardens": 4,
  Houston: 5,
  Arlington: 5,
  "Kansas City": 5,
  "Santa Clara": 7,
  Inglewood: 7,
  Seattle: 7,
  Vancouver: 7,
};

/** Convierte fecha/hora local de la sede a Date en UTC. */
export function kickoffUTC(m: FixtureMatch): Date {
  const offset = CITY_UTC_OFFSET[m.city];
  if (offset === undefined) throw new Error(`Ciudad sin offset UTC: ${m.city}`);
  const [y, mo, d] = m.date.split("-").map(Number);
  const [h, min] = m.time.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h + offset, min));
}

export const FIXTURE_GROUP_STAGE: FixtureMatch[] = [
  // ---------- Grupo A ----------
  { group: "A", a: "MEX", b: "RSA", date: "2026-06-11", time: "13:00", city: "Ciudad de México", stadium: "Estadio Azteca", scoreA: 2, scoreB: 0 },
  { group: "A", a: "KOR", b: "CZE", date: "2026-06-11", time: "20:00", city: "Zapopan", stadium: "Estadio Akron" },
  { group: "A", a: "CZE", b: "RSA", date: "2026-06-18", time: "12:00", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
  { group: "A", a: "MEX", b: "KOR", date: "2026-06-18", time: "19:00", city: "Zapopan", stadium: "Estadio Akron" },
  { group: "A", a: "CZE", b: "MEX", date: "2026-06-24", time: "19:00", city: "Ciudad de México", stadium: "Estadio Azteca" },
  { group: "A", a: "RSA", b: "KOR", date: "2026-06-24", time: "19:00", city: "Guadalupe", stadium: "Estadio BBVA" },
  // ---------- Grupo B ----------
  { group: "B", a: "CAN", b: "BIH", date: "2026-06-12", time: "15:00", city: "Toronto", stadium: "BMO Field" },
  { group: "B", a: "QAT", b: "SUI", date: "2026-06-13", time: "12:00", city: "Santa Clara", stadium: "Levi's Stadium" },
  { group: "B", a: "SUI", b: "BIH", date: "2026-06-18", time: "12:00", city: "Inglewood", stadium: "SoFi Stadium" },
  { group: "B", a: "CAN", b: "QAT", date: "2026-06-18", time: "15:00", city: "Vancouver", stadium: "BC Place" },
  { group: "B", a: "SUI", b: "CAN", date: "2026-06-24", time: "12:00", city: "Vancouver", stadium: "BC Place" },
  { group: "B", a: "BIH", b: "QAT", date: "2026-06-24", time: "12:00", city: "Seattle", stadium: "Lumen Field" },
  // ---------- Grupo C ----------
  { group: "C", a: "BRA", b: "MAR", date: "2026-06-13", time: "18:00", city: "East Rutherford", stadium: "MetLife Stadium" },
  { group: "C", a: "HAI", b: "SCO", date: "2026-06-13", time: "21:00", city: "Foxborough", stadium: "Gillette Stadium" },
  { group: "C", a: "SCO", b: "MAR", date: "2026-06-19", time: "18:00", city: "Foxborough", stadium: "Gillette Stadium" },
  { group: "C", a: "BRA", b: "HAI", date: "2026-06-19", time: "20:30", city: "Filadelfia", stadium: "Lincoln Financial Field" },
  { group: "C", a: "SCO", b: "BRA", date: "2026-06-24", time: "18:00", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
  { group: "C", a: "MAR", b: "HAI", date: "2026-06-24", time: "18:00", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
  // ---------- Grupo D ----------
  { group: "D", a: "USA", b: "PAR", date: "2026-06-12", time: "18:00", city: "Inglewood", stadium: "SoFi Stadium" },
  { group: "D", a: "AUS", b: "TUR", date: "2026-06-13", time: "21:00", city: "Vancouver", stadium: "BC Place" },
  { group: "D", a: "USA", b: "AUS", date: "2026-06-19", time: "12:00", city: "Seattle", stadium: "Lumen Field" },
  { group: "D", a: "TUR", b: "PAR", date: "2026-06-19", time: "20:00", city: "Santa Clara", stadium: "Levi's Stadium" },
  { group: "D", a: "TUR", b: "USA", date: "2026-06-25", time: "19:00", city: "Inglewood", stadium: "SoFi Stadium" },
  { group: "D", a: "PAR", b: "AUS", date: "2026-06-25", time: "19:00", city: "Santa Clara", stadium: "Levi's Stadium" },
  // ---------- Grupo E ----------
  { group: "E", a: "GER", b: "CUW", date: "2026-06-14", time: "12:00", city: "Houston", stadium: "NRG Stadium" },
  { group: "E", a: "CIV", b: "ECU", date: "2026-06-14", time: "19:00", city: "Filadelfia", stadium: "Lincoln Financial Field" },
  { group: "E", a: "GER", b: "CIV", date: "2026-06-20", time: "16:00", city: "Toronto", stadium: "BMO Field" },
  { group: "E", a: "ECU", b: "CUW", date: "2026-06-20", time: "19:00", city: "Kansas City", stadium: "Arrowhead Stadium" },
  { group: "E", a: "CUW", b: "CIV", date: "2026-06-25", time: "16:00", city: "Filadelfia", stadium: "Lincoln Financial Field" },
  { group: "E", a: "ECU", b: "GER", date: "2026-06-25", time: "16:00", city: "East Rutherford", stadium: "MetLife Stadium" },
  // ---------- Grupo F ----------
  { group: "F", a: "NED", b: "JPN", date: "2026-06-14", time: "15:00", city: "Arlington", stadium: "AT&T Stadium" },
  { group: "F", a: "SWE", b: "TUN", date: "2026-06-14", time: "20:00", city: "Guadalupe", stadium: "Estadio BBVA" },
  { group: "F", a: "NED", b: "SWE", date: "2026-06-20", time: "12:00", city: "Houston", stadium: "NRG Stadium" },
  { group: "F", a: "TUN", b: "JPN", date: "2026-06-20", time: "22:00", city: "Guadalupe", stadium: "Estadio BBVA" },
  { group: "F", a: "JPN", b: "SWE", date: "2026-06-25", time: "18:00", city: "Arlington", stadium: "AT&T Stadium" },
  { group: "F", a: "TUN", b: "NED", date: "2026-06-25", time: "18:00", city: "Kansas City", stadium: "Arrowhead Stadium" },
  // ---------- Grupo G ----------
  { group: "G", a: "BEL", b: "EGY", date: "2026-06-15", time: "12:00", city: "Seattle", stadium: "Lumen Field" },
  { group: "G", a: "IRN", b: "NZL", date: "2026-06-15", time: "18:00", city: "Inglewood", stadium: "SoFi Stadium" },
  { group: "G", a: "BEL", b: "IRN", date: "2026-06-21", time: "12:00", city: "Inglewood", stadium: "SoFi Stadium" },
  { group: "G", a: "NZL", b: "EGY", date: "2026-06-21", time: "18:00", city: "Vancouver", stadium: "BC Place" },
  { group: "G", a: "EGY", b: "IRN", date: "2026-06-26", time: "20:00", city: "Seattle", stadium: "Lumen Field" },
  { group: "G", a: "NZL", b: "BEL", date: "2026-06-26", time: "20:00", city: "Vancouver", stadium: "BC Place" },
  // ---------- Grupo H ----------
  { group: "H", a: "ESP", b: "CPV", date: "2026-06-15", time: "12:00", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
  { group: "H", a: "KSA", b: "URU", date: "2026-06-15", time: "18:00", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
  { group: "H", a: "ESP", b: "KSA", date: "2026-06-21", time: "12:00", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
  { group: "H", a: "URU", b: "CPV", date: "2026-06-21", time: "18:00", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
  { group: "H", a: "CPV", b: "KSA", date: "2026-06-26", time: "19:00", city: "Houston", stadium: "NRG Stadium" },
  { group: "H", a: "URU", b: "ESP", date: "2026-06-26", time: "18:00", city: "Zapopan", stadium: "Estadio Akron" },
  // ---------- Grupo I ----------
  { group: "I", a: "FRA", b: "SEN", date: "2026-06-16", time: "15:00", city: "East Rutherford", stadium: "MetLife Stadium" },
  { group: "I", a: "IRQ", b: "NOR", date: "2026-06-16", time: "18:00", city: "Foxborough", stadium: "Gillette Stadium" },
  { group: "I", a: "FRA", b: "IRQ", date: "2026-06-22", time: "17:00", city: "Filadelfia", stadium: "Lincoln Financial Field" },
  { group: "I", a: "NOR", b: "SEN", date: "2026-06-22", time: "20:00", city: "East Rutherford", stadium: "MetLife Stadium" },
  { group: "I", a: "NOR", b: "FRA", date: "2026-06-26", time: "15:00", city: "Foxborough", stadium: "Gillette Stadium" },
  { group: "I", a: "SEN", b: "IRQ", date: "2026-06-26", time: "15:00", city: "Toronto", stadium: "BMO Field" },
  // ---------- Grupo J ----------
  { group: "J", a: "ARG", b: "ALG", date: "2026-06-16", time: "20:00", city: "Kansas City", stadium: "Arrowhead Stadium" },
  { group: "J", a: "AUT", b: "JOR", date: "2026-06-16", time: "21:00", city: "Santa Clara", stadium: "Levi's Stadium" },
  { group: "J", a: "ARG", b: "AUT", date: "2026-06-22", time: "12:00", city: "Arlington", stadium: "AT&T Stadium" },
  { group: "J", a: "JOR", b: "ALG", date: "2026-06-22", time: "20:00", city: "Santa Clara", stadium: "Levi's Stadium" },
  { group: "J", a: "ALG", b: "AUT", date: "2026-06-27", time: "21:00", city: "Kansas City", stadium: "Arrowhead Stadium" },
  { group: "J", a: "JOR", b: "ARG", date: "2026-06-27", time: "21:00", city: "Arlington", stadium: "AT&T Stadium" },
  // ---------- Grupo K ----------
  { group: "K", a: "POR", b: "COD", date: "2026-06-17", time: "12:00", city: "Houston", stadium: "NRG Stadium" },
  { group: "K", a: "UZB", b: "COL", date: "2026-06-17", time: "20:00", city: "Ciudad de México", stadium: "Estadio Azteca" },
  { group: "K", a: "POR", b: "UZB", date: "2026-06-23", time: "12:00", city: "Houston", stadium: "NRG Stadium" },
  { group: "K", a: "COL", b: "COD", date: "2026-06-23", time: "20:00", city: "Zapopan", stadium: "Estadio Akron" },
  { group: "K", a: "COL", b: "POR", date: "2026-06-27", time: "19:30", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
  { group: "K", a: "COD", b: "UZB", date: "2026-06-27", time: "19:30", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
  // ---------- Grupo L ----------
  { group: "L", a: "ENG", b: "CRO", date: "2026-06-17", time: "15:00", city: "Arlington", stadium: "AT&T Stadium" },
  { group: "L", a: "GHA", b: "PAN", date: "2026-06-17", time: "19:00", city: "Toronto", stadium: "BMO Field" },
  { group: "L", a: "ENG", b: "GHA", date: "2026-06-23", time: "16:00", city: "Foxborough", stadium: "Gillette Stadium" },
  { group: "L", a: "PAN", b: "CRO", date: "2026-06-23", time: "19:00", city: "Toronto", stadium: "BMO Field" },
  { group: "L", a: "PAN", b: "ENG", date: "2026-06-27", time: "21:00", city: "East Rutherford", stadium: "MetLife Stadium" },
  { group: "L", a: "CRO", b: "GHA", date: "2026-06-27", time: "21:00", city: "Filadelfia", stadium: "Lincoln Financial Field" },
];
