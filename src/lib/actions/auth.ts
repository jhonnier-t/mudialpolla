"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type ActionState = { error?: string } | null;

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) return { error: "Usuario y contraseña son obligatorios." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Credenciales inválidas." };
  }

  await createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
