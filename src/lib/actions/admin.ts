"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MATCH_STATUS, PHASES, ROLES } from "@/lib/constants";

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
  const flag = String(formData.get("flag") ?? "").trim();
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
