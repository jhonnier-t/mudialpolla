import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const COOKIE_NAME = "polla_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-no-usar-en-produccion"
);

export type Session = {
  userId: string;
  username: string;
  name: string;
  role: string; // ADMIN | PLAYER
};

export async function createSession(session: Session) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
});

/**
 * Sesión obligatoria para páginas protegidas. El layout también redirige,
 * pero layout y página se renderizan EN PARALELO en App Router, así que
 * cada página debe validar por su cuenta (nunca usar getSession()! con `!`).
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
