/**
 * Seed de datos de ejemplo para la Polla Mundialista.
 * Crea: usuario admin, jugadores demo, equipos y partidos de muestra.
 *
 * Ejecutar con: npm run db:seed
 *
 * NOTA: los partidos son datos DEMO. El administrador debe registrar el
 * fixture real desde el panel /admin/partidos.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEAMS: { name: string; code: string; flag: string; groupName: string }[] = [
  { name: "México", code: "MEX", flag: "🇲🇽", groupName: "A" },
  { name: "Sudáfrica", code: "RSA", flag: "🇿🇦", groupName: "A" },
  { name: "Canadá", code: "CAN", flag: "🇨🇦", groupName: "B" },
  { name: "Catar", code: "QAT", flag: "🇶🇦", groupName: "B" },
  { name: "Estados Unidos", code: "USA", flag: "🇺🇸", groupName: "D" },
  { name: "Paraguay", code: "PAR", flag: "🇵🇾", groupName: "D" },
  { name: "Colombia", code: "COL", flag: "🇨🇴", groupName: "K" },
  { name: "Argentina", code: "ARG", flag: "🇦🇷", groupName: "J" },
  { name: "Brasil", code: "BRA", flag: "🇧🇷", groupName: "C" },
  { name: "España", code: "ESP", flag: "🇪🇸", groupName: "H" },
  { name: "Francia", code: "FRA", flag: "🇫🇷", groupName: "I" },
  { name: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", groupName: "E" },
  { name: "Alemania", code: "GER", flag: "🇩🇪", groupName: "G" },
  { name: "Portugal", code: "POR", flag: "🇵🇹", groupName: "F" },
  { name: "Países Bajos", code: "NED", flag: "🇳🇱", groupName: "L" },
  { name: "Ecuador", code: "ECU", flag: "🇪🇨", groupName: "L" },
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
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: { name: t.name, flag: t.flag, groupName: t.groupName },
      create: t,
    });
    teamByCode[t.code] = team.id;
  }

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
