import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== ROLES.ADMIN) redirect("/");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="mb-3 text-xl font-bold">Administración</h1>
        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:whitespace-normal">
          <Link href="/admin/partidos" className="btn-secondary shrink-0 px-3 py-1.5">
            Partidos y resultados
          </Link>
          <Link href="/admin/pronosticos" className="btn-secondary shrink-0 px-3 py-1.5">
            Pronósticos
          </Link>
          <Link href="/admin/equipos" className="btn-secondary shrink-0 px-3 py-1.5">
            Equipos
          </Link>
          <Link href="/admin/usuarios" className="btn-secondary shrink-0 px-3 py-1.5">
            Participantes
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
