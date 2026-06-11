import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== ROLES.ADMIN) redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <h1 className="mr-4 text-xl font-bold">Administración</h1>
        <Link href="/admin/partidos" className="btn-secondary px-3 py-1.5">
          Partidos y resultados
        </Link>
        <Link href="/admin/equipos" className="btn-secondary px-3 py-1.5">
          Equipos
        </Link>
        <Link href="/admin/usuarios" className="btn-secondary px-3 py-1.5">
          Participantes
        </Link>
      </div>
      {children}
    </div>
  );
}
