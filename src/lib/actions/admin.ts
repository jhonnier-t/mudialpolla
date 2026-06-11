"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MATCH_STATUS, PHASES, ROLES } from "@/lib/constants";
import { FLAG_BY_CODE } from "@/lib/flags";

export type AdminState = { error?: string; ok?: boolean } | null;

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== ROLES.ADMIN) {
    throw new Error("No autorizado");
  }
  return session;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/predicciones");
  revalidatePath("/posiciones");
  revalidatePath("/admin/partidos");
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/usuarios");
}

// ---------- Equipos ----------

export async function createTeam(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  // Si no se indica bandera, se autocompleta por código FIFA
  const flag = String(formData.get("flag") ?? "").trim() || FLAG_BY_CODE[code] || "";
  const groupName = String(formData.get("groupName") ?? "").trim().toUpperCase() || null;

  if (!name || !/^[A-Z]{3}$/.test(code)) {
    return { error: "Nombre obligatorio y código FIFA de 3 letras (ej: COL)." };
  }

  try {
    await prisma.team.create({ data: { name, code, flag, groupName } });
  } catch {
    return { error: "Ya existe un equipo con ese nombre o código." };
  }
  revalidateAll();
  return { ok: true };
}

/** Actualiza bandera y grupo de un equipo existente. */
export async function updateTeam(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const flag = String(formData.get("flag") ?? "").trim();
  const groupName = String(formData.get("groupName") ?? "").trim().toUpperCase() || null;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return;
  await prisma.team.update({
    where: { id },
    data: { flag: flag || FLAG_BY_CODE[team.code] || team.flag, groupName },
  });
  revalidateAll();
}

export async function deleteTeam(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const matches = await prisma.match.count({ where: { OR: [{ teamAId: id }, { teamBId: id }] } });
  if (matches > 0) return; // no se elimina un equipo con partidos asociados
  await prisma.team.delete({ where: { id } });
  revalidateAll();
}

// ---------- Partidos ----------

export async function createMatch(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const teamAId = String(formData.get("teamAId") ?? "");
  const teamBId = String(formData.get("teamBId") ?? "");
  const kickoffRaw = String(formData.get("kickoff") ?? "");
  const phase = String(formData.get("phase") ?? PHASES.GROUP);
  const groupName = String(formData.get("groupName") ?? "").trim().toUpperCase() || null;
  const stadium = String(formData.get("stadium") ?? "").trim();

  if (!teamAId || !teamBId || teamAId === teamBId) {
    return { error: "Selecciona dos equipos distintos." };
  }
  const kickoff = new Date(kickoffRaw);
  if (!kickoffRaw || isNaN(kickoff.getTime())) {
    return { error: "Fecha y hora del partido inválidas." };
  }
  if (!Object.values(PHASES).includes(phase as never)) {
    return { error: "Fase inválida." };
  }

  await prisma.match.create({
    data: { teamAId, teamBId, kickoff, phase, groupName, stadium },
  });
  revalidateAll();
  return { ok: true };
}

/** Registra (o corrige) el resultado final de un partido. */
export async function setResult(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const scoreA = Number(formData.get("scoreA"));
  const scoreB = Number(formData.get("scoreB"));

  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    return { error: "Marcador inválido." };
  }

  await prisma.match.update({
    where: { id },
    data: { scoreA, scoreB, status: MATCH_STATUS.FINISHED },
  });
  revalidateAll();
  return { ok: true };
}

/** Reabre un partido (quita el resultado), p. ej. si se registró por error. */
export async function reopenMatch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.match.update({
    where: { id },
    data: { scoreA: null, scoreB: null, status: MATCH_STATUS.SCHEDULED },
  });
  revalidateAll();
}

export async function deleteMatch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.match.delete({ where: { id } });
  revalidateAll();
}

// ---------- Pronósticos de jugadores (corrección por el admin) ----------

/**
 * Registra o corrige el pronóstico de UN JUGADOR para un partido.
 * Sin restricción de hora: existe justamente para subsanar errores u
 * omisiones (p. ej. partidos jugados antes de poner en marcha la polla).
 * Ver LINEAMIENTOS.md §6: toda corrección debe informarse al grupo.
 */
export async function setUserPrediction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  const predA = Number(formData.get("predA"));
  const predB = Number(formData.get("predB"));

  if (!Number.isInteger(predA) || !Number.isInteger(predB) || predA < 0 || predB < 0 || predA > 20 || predB > 20) {
    return { error: "Marcador inválido (enteros entre 0 y 20)." };
  }
  const [user, match] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.match.findUnique({ where: { id: matchId } }),
  ]);
  if (!user || user.role !== ROLES.PLAYER) return { error: "El usuario no es un participante." };
  if (!match) return { error: "El partido no existe." };

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { predA, predB },
    create: { userId, matchId, predA, predB },
  });
  revalidateAll();
  revalidatePath("/admin/pronosticos");
  return { ok: true };
}

/** Elimina el pronóstico de un jugador para un partido. */
export async function deleteUserPrediction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  await prisma.prediction.deleteMany({ where: { userId, matchId } });
  revalidateAll();
  revalidatePath("/admin/pronosticos");
}

// ---------- Usuarios ----------

export async function createUser(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? ROLES.PLAYER);

  if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
    return { error: "Usuario inválido (3-20 caracteres: letras, números, . _ -)." };
  }
  if (!name) return { error: "El nombre es obligatorio." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (![ROLES.ADMIN, ROLES.PLAYER].includes(role as never)) return { error: "Rol inválido." };

  try {
    await prisma.user.create({
      data: { username, name, passwordHash: await bcrypt.hash(password, 10), role },
    });
  } catch {
    return { error: "Ese nombre de usuario ya existe." };
  }
  revalidateAll();
  return { ok: true };
}

export async function toggleUserActive(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === session.userId) return; // un admin no se desactiva a sí mismo
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  revalidateAll();
}

export async function resetPassword(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  return { ok: true };
}
