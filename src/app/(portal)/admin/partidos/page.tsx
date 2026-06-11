import { prisma } from "@/lib/db";
import { fmtKickoff } from "@/lib/format";
import { MATCH_STATUS, PHASE_LABELS } from "@/lib/constants";
import { deleteMatch, reopenMatch } from "@/lib/actions/admin";
import { MatchForm } from "@/components/admin/MatchForm";
import { ResultForm } from "@/components/admin/ResultForm";
import { TeamFlag } from "@/components/TeamFlag";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function AdminPartidosPage() {
  const [teams, matches] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.match.findMany({
      include: { teamA: true, teamB: true, _count: { select: { predictions: true } } },
      orderBy: { kickoff: "asc" },
    }),
  ]);

  const pending = matches.filter((m) => m.status === MATCH_STATUS.SCHEDULED);
  const finished = matches.filter((m) => m.status === MATCH_STATUS.FINISHED);

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="mb-4 font-semibold">Programar nuevo partido</h2>
        {teams.length < 2 ? (
          <p className="text-sm text-slate-500">
            Registra al menos dos equipos en la sección Equipos para programar partidos.
          </p>
        ) : (
          <MatchForm teams={teams.map((t) => ({ id: t.id, name: t.name, flag: t.flag }))} />
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">
          Partidos programados / en juego ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="card text-sm text-slate-500">No hay partidos pendientes.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((m) => {
              const inPlay = m.kickoff <= new Date();
              return (
              <div key={m.id} className="card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <TeamFlag code={m.teamA.code} fallback={m.teamA.flag} />
                    {m.teamA.name}
                    <span className="text-xs text-slate-400">vs</span>
                    <TeamFlag code={m.teamB.code} fallback={m.teamB.flag} />
                    {m.teamB.name}
                    {inPlay ? (
                      <span className="badge animate-pulse bg-amber-100 text-amber-700">
                        ● En juego
                      </span>
                    ) : (
                      <span className="badge bg-blue-100 text-blue-700">Programado</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {PHASE_LABELS[m.phase]}
                    {m.groupName ? ` · Grupo ${m.groupName}` : ""} · {fmtKickoff(m.kickoff)}
                    {m.stadium ? ` · ${m.stadium}` : ""} · {m._count.predictions} pronóstico
                    {m._count.predictions === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ResultForm matchId={m.id} />
                  <form action={deleteMatch}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton confirmLabel="¿Eliminar partido?">Eliminar</ConfirmButton>
                  </form>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Partidos finalizados ({finished.length})</h2>
        {finished.length === 0 ? (
          <div className="card text-sm text-slate-500">Aún no hay resultados registrados.</div>
        ) : (
          <div className="space-y-3">
            {finished.map((m) => (
              <div key={m.id} className="card flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-emerald-500">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <TeamFlag code={m.teamA.code} fallback={m.teamA.flag} />
                    {m.teamA.name}
                    <span className="badge bg-emerald-100 font-bold text-emerald-700">
                      {m.scoreA} - {m.scoreB}
                    </span>
                    <TeamFlag code={m.teamB.code} fallback={m.teamB.flag} />
                    {m.teamB.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {PHASE_LABELS[m.phase]}
                    {m.groupName ? ` · Grupo ${m.groupName}` : ""} · {fmtKickoff(m.kickoff)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ResultForm matchId={m.id} initialA={m.scoreA} initialB={m.scoreB} />
                  <form action={reopenMatch}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton
                      confirmLabel="¿Quitar resultado?"
                      className="btn-secondary px-3 py-2"
                    >
                      Reabrir
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
