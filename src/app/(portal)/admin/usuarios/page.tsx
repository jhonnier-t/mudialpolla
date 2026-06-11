import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { toggleUserActive } from "@/lib/actions/admin";
import { UserForm } from "@/components/admin/UserForm";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function AdminUsuariosPage() {
  const session = await requireSession();
  const users = await prisma.user.findMany({
    include: { _count: { select: { predictions: true } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="mb-4 font-semibold">Crear participante</h2>
        <UserForm />
      </section>

      <section className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 text-center">Pronósticos</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className={u.active ? undefined : "opacity-50"}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">@{u.username}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.role === ROLES.ADMIN
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.role === ROLES.ADMIN ? "Admin" : "Participante"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{u._count.predictions}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <ResetPasswordForm userId={u.id} />
                    {u.id !== session.userId && (
                      <form action={toggleUserActive}>
                        <input type="hidden" name="id" value={u.id} />
                        {u.active ? (
                          <ConfirmButton confirmLabel="¿Desactivar?">Desactivar</ConfirmButton>
                        ) : (
                          <button type="submit" className="btn-secondary px-3 py-2">
                            Activar
                          </button>
                        )}
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
