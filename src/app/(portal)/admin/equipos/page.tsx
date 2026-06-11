import { prisma } from "@/lib/db";
import { deleteTeam, updateTeam } from "@/lib/actions/admin";
import { TeamForm } from "@/components/admin/TeamForm";
import { TeamFlag } from "@/components/TeamFlag";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function AdminEquiposPage() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { matchesA: true, matchesB: true } } },
    orderBy: [{ groupName: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="mb-4 font-semibold">Agregar equipo</h2>
        <TeamForm />
      </section>

      <section className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3 text-center">Partidos</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teams.map((t) => {
              const matchCount = t._count.matchesA + t._count.matchesB;
              return (
                <tr key={t.id}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium">
                      <TeamFlag code={t.code} fallback={t.flag} size="md" />
                      {t.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.code}</td>
                  <td className="px-4 py-3">
                    <form action={updateTeam} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <input
                        name="groupName"
                        defaultValue={t.groupName ?? ""}
                        className="input w-12 text-center uppercase"
                        maxLength={1}
                        placeholder="—"
                        aria-label="Grupo"
                      />
                      <button type="submit" className="btn-secondary px-3 py-1.5">
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-center">{matchCount}</td>
                  <td className="px-4 py-3 text-right">
                    {matchCount === 0 ? (
                      <form action={deleteTeam} className="inline">
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmButton
                          confirmLabel="¿Eliminar equipo?"
                          className="btn-danger px-3 py-1.5"
                        >
                          Eliminar
                        </ConfirmButton>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">Con partidos asociados</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {teams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Aún no hay equipos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
