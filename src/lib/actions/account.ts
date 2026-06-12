"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type AccountState = { error?: string; ok?: boolean } | null;

/** Cambio de contraseña del propio usuario (exige la contraseña actual). */
export async function changePassword(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await getSession();
  if (!session) return { error: "Sesión expirada. Inicia sesión de nuevo." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }
  if (next !== confirm) {
    return { error: "La confirmación no coincide con la nueva contraseña." };
  }
  if (next === current) {
    return { error: "La nueva contraseña debe ser distinta a la actual." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "La contraseña actual es incorrecta." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 10) },
  });
  return { ok: true };
}
