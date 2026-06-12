import { requireSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function CuentaPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi cuenta</h1>
        <p className="text-sm text-slate-500">Administra los datos de tu acceso.</p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">Datos</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium">{session.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Usuario</dt>
            <dd className="font-medium">@{session.username}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Rol</dt>
            <dd>
              <span
                className={`badge ${
                  session.role === ROLES.ADMIN
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {session.role === ROLES.ADMIN ? "Administrador" : "Participante"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2 className="mb-4 font-semibold">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
