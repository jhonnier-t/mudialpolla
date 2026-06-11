"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type PredictionState = { error?: string; ok?: boolean } | null;

/**
 * Guarda o actualiza el pronóstico del usuario para un partido.
 * Regla clave (LINEAMIENTOS.md): se bloquea al inicio del partido.
 */
export async function savePrediction(
  _prev: PredictionState,
  formData: FormData
): Promise<PredictionState> {
  const session = await getSession();
  if (!session) return { error: "Sesión expirada. Inicia sesión de nuevo." };

  const matchId = String(formData.get("matchId") ?? "");
  const predA = Number(formData.get("predA"));
  const predB = Number(formData.get("predB"));

  if (!matchId || !Number.isInteger(predA) || !Number.isInteger(predB) || predA < 0 || predB < 0 || predA > 20 || predB > 20) {
    return { error: "Marcador inválido (enteros entre 0 y 20)." };
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return { error: "El partido no existe." };
  if (match.status === "FINISHED" || match.kickoff <= new Date()) {
    return { error: "El partido ya inició: pronóstico cerrado." };
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.userId, matchId } },
    update: { predA, predB },
    create: { userId: session.userId, matchId, predA, predB },
  });

  revalidatePath("/predicciones");
  revalidatePath("/");
  return { ok: true };
}
