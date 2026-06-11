import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { ROLES } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            ⚽ <span>Polla Mundialista</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1 text-sm font-medium">
            <Link href="/" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">
              Inicio
            </Link>
            {session.role !== ROLES.ADMIN && (
              <Link href="/predicciones" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">
                Mis predicciones
              </Link>
            )}
            <Link href="/posiciones" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">
              Posiciones
            </Link>
            {session.role === ROLES.ADMIN && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
              >
                Administración
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">Hola, {session.name}</span>
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="btn-secondary px-3 py-1.5">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
