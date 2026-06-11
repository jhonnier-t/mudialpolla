/**
 * Seed de la Polla Mundialista — DATOS REALES del Mundial 2026.
 * Crea: usuario admin, jugadores demo, los 48 equipos clasificados con sus
 * grupos reales, y los 72 partidos reales de la fase de grupos (fechas y
 * estadios oficiales, horas convertidas a UTC).
 *
 * Ejecutar con: npm run db:seed
 * Es idempotente: los equipos se actualizan (upsert) y los partidos solo se
 * insertan si la tabla está vacía. Los partidos de fases eliminatorias se
 * registran desde /admin/partidos cuando se definan los cruces.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FLAG_BY_CODE } from "../src/lib/flags";
import { TEAMS_2026, FIXTURE_GROUP_STAGE, kickoffUTC } from "./fixture-2026";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando datos reales del Mundial 2026...");

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

  // --- Equipos: los 48 clasificados con grupo real ---
  const teamByCode: Record<string, string> = {};
  for (const t of TEAMS_2026) {
    const flag = FLAG_BY_CODE[t.code] ?? "";
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: { name: t.name, flag, groupName: t.group },
      create: { name: t.name, code: t.code, flag, groupName: t.group },
    });
    teamByCode[t.code] = team.id;
  }
  console.log(`   ${TEAMS_2026.length} equipos con grupo real y bandera.`);

  // --- Partidos: fixture real de fase de grupos ---
  const existing = await prisma.match.count();
  if (existing === 0) {
    for (const m of FIXTURE_GROUP_STAGE) {
      const finished = m.scoreA !== undefined && m.scoreB !== undefined;
      await prisma.match.create({
        data: {
          phase: "GROUP",
          groupName: m.group,
          teamAId: teamByCode[m.a],
          teamBId: teamByCode[m.b],
          kickoff: kickoffUTC(m),
          stadium: `${m.stadium}, ${m.city}`,
          scoreA: finished ? m.scoreA : null,
          scoreB: finished ? m.scoreB : null,
          status: finished ? "FINISHED" : "SCHEDULED",
        },
      });
    }
    console.log(`   ${FIXTURE_GROUP_STAGE.length} partidos reales de fase de grupos.`);
  } else {
    console.log(`   Tabla de partidos no vacía (${existing}): no se insertó el fixture.`);
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
