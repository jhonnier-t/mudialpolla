/**
 * Seed de datos de ejemplo para la Polla Mundialista.
 * Crea: usuario admin, jugadores demo, los equipos clasificados al Mundial
 * 2026 con sus banderas, y partidos de muestra.
 *
 * Ejecutar con: npm run db:seed
 *
 * NOTA: los partidos y los grupos asignados son datos DEMO. El administrador
 * debe registrar el fixture y los grupos reales desde el panel /admin.
 * Los 6 cupos de repechaje se agregan manualmente cuando se definan.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FLAG_BY_CODE } from "../src/lib/flags";

const prisma = new PrismaClient();

// Clasificados al Mundial 2026 (42 cupos directos). groupName solo en los
// equipos usados por los partidos demo.
const TEAMS: { name: string; code: string; groupName?: string }[] = [
  // Anfitriones
  { name: "México", code: "MEX", groupName: "A" },
  { name: "Canadá", code: "CAN", groupName: "B" },
  { name: "Estados Unidos", code: "USA", groupName: "D" },
  // CONMEBOL
  { name: "Argentina", code: "ARG", groupName: "J" },
  { name: "Brasil", code: "BRA", groupName: "C" },
  { name: "Colombia", code: "COL", groupName: "K" },
  { name: "Ecuador", code: "ECU", groupName: "L" },
  { name: "Uruguay", code: "URU" },
  { name: "Paraguay", code: "PAR", groupName: "D" },
  // UEFA
  { name: "Inglaterra", code: "ENG", groupName: "E" },
  { name: "Escocia", code: "SCO" },
  { name: "Francia", code: "FRA", groupName: "I" },
  { name: "Alemania", code: "GER", groupName: "G" },
  { name: "España", code: "ESP", groupName: "H" },
  { name: "Portugal", code: "POR", groupName: "F" },
  { name: "Países Bajos", code: "NED", groupName: "L" },
  { name: "Bélgica", code: "BEL" },
  { name: "Croacia", code: "CRO" },
  { name: "Suiza", code: "SUI" },
  { name: "Austria", code: "AUT" },
  { name: "Noruega", code: "NOR" },
  // AFC
  { name: "Japón", code: "JPN" },
  { name: "Corea del Sur", code: "KOR" },
  { name: "Irán", code: "IRN" },
  { name: "Australia", code: "AUS" },
  { name: "Jordania", code: "JOR" },
  { name: "Uzbekistán", code: "UZB" },
  { name: "Catar", code: "QAT", groupName: "B" },
  { name: "Arabia Saudita", code: "KSA" },
  // CAF
  { name: "Marruecos", code: "MAR" },
  { name: "Túnez", code: "TUN" },
  { name: "Argelia", code: "ALG" },
  { name: "Egipto", code: "EGY" },
  { name: "Ghana", code: "GHA" },
  { name: "Senegal", code: "SEN" },
  { name: "Costa de Marfil", code: "CIV" },
  { name: "Cabo Verde", code: "CPV" },
  { name: "Sudáfrica", code: "RSA", groupName: "A" },
  // CONCACAF
  { name: "Panamá", code: "PAN" },
  { name: "Curazao", code: "CUW" },
  { name: "Haití", code: "HAI" },
  // OFC
  { name: "Nueva Zelanda", code: "NZL" },
];

async function main() {
  console.log("🌱 Sembrando datos de ejemplo...");

  // --- Usuarios ---
  const adminPass = await bcrypt.hash("admin123", 10);
  const playerPass = await bcrypt.hash("polla2026", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrador",
      passwordHash: adminPass,
      role: "ADMIN",
    },
  });

  for (const p of [
    { username: "juan", name: "Juan Pérez" },
    { username: "maria", name: "María Gómez" },
  ]) {
    await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: { ...p, passwordHash: playerPass, role: "PLAYER" },
    });
  }

  // --- Equipos ---
  const teamByCode: Record<string, string> = {};
  for (const t of TEAMS) {
    const flag = FLAG_BY_CODE[t.code] ?? "";
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: { name: t.name, flag, groupName: t.groupName ?? null },
      create: { name: t.name, code: t.code, flag, groupName: t.groupName ?? null },
    });
    teamByCode[t.code] = team.id;
  }
  console.log(`   ${TEAMS.length} equipos clasificados con bandera.`);

  // --- Partidos demo (fechas relativas a hoy para poder probar el flujo) ---
  const existing = await prisma.match.count();
  if (existing === 0) {
    const now = new Date();
    const at = (days: number, hour: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      d.setHours(hour, 0, 0, 0);
      return d;
    };

    const demoMatches = [
      // Un partido ya finalizado para ver puntuación
      { a: "MEX", b: "RSA", kickoff: at(-1, 19), stadium: "Estadio Azteca, CDMX", scoreA: 2, scoreB: 1, status: "FINISHED", groupName: "A" },
      // Partidos próximos para registrar pronósticos
      { a: "CAN", b: "QAT", kickoff: at(1, 18), stadium: "BMO Field, Toronto", groupName: "B" },
      { a: "USA", b: "PAR", kickoff: at(1, 21), stadium: "SoFi Stadium, Los Ángeles", groupName: "D" },
      { a: "COL", b: "POR", kickoff: at(2, 16), stadium: "MetLife Stadium, Nueva York", groupName: "K" },
      { a: "ARG", b: "ECU", kickoff: at(2, 19), stadium: "AT&T Stadium, Dallas", groupName: "J" },
      { a: "BRA", b: "ESP", kickoff: at(3, 17), stadium: "Hard Rock Stadium, Miami", groupName: "C" },
      { a: "FRA", b: "GER", kickoff: at(3, 20), stadium: "Estadio BBVA, Monterrey", groupName: "I" },
      { a: "ENG", b: "NED", kickoff: at(4, 15), stadium: "Lumen Field, Seattle", groupName: "E" },
    ];

    for (const m of demoMatches) {
      await prisma.match.create({
        data: {
          phase: "GROUP",
          groupName: m.groupName,
          teamAId: teamByCode[m.a],
          teamBId: teamByCode[m.b],
          kickoff: m.kickoff,
          stadium: m.stadium,
          scoreA: m.scoreA ?? null,
          scoreB: m.scoreB ?? null,
          status: m.status ?? "SCHEDULED",
        },
      });
    }

    // Pronósticos demo sobre el partido finalizado
    const finished = await prisma.match.findFirst({ where: { status: "FINISHED" } });
    const juan = await prisma.user.findUnique({ where: { username: "juan" } });
    const maria = await prisma.user.findUnique({ where: { username: "maria" } });
    if (finished && juan && maria) {
      await prisma.prediction.createMany({
        data: [
          { userId: juan.id, matchId: finished.id, predA: 2, predB: 1 }, // exacto: 5 pts
          { userId: maria.id, matchId: finished.id, predA: 1, predB: 0 }, // resultado: 3 pts
        ],
      });
    }
  }

  console.log("✅ Seed completado.");
  console.log("   Admin:    admin / admin123");
  console.log("   Jugador:  juan  / polla2026");
  console.log("   Jugador:  maria / polla2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
