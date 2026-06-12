import { prisma } from "@/lib/db";
import { fmtKickoff } from "@/lib/format";
import { pointsFor } from "@/lib/scoring";
import { MATCH_STATUS, PHASE_LABELS, ROLES } from "@/lib/constants";
import { deleteUserPrediction } from "@/lib/actions/admin";
import { AdminPredictionForm } from "@/components/admin/AdminPredictionForm";
import { MatchPicker } from "@/components/admin/MatchPicker";
import { TeamFlag } from "@/components/TeamFlag";
import { ConfirmButton } from "@/components/ConfirmButton";

type Props = { searchParams: Promise<{ match?: string }> };

export default async function AdminPronosticosPage({ searchParams }: Props) {
  const { match: matchId } = await searchParams;

  const matches = await prisma.match.findMany({
    include: { teamA: true, teamB: true },
    orderBy: { kickoff: "asc" },
  });

  const selected = matchId ? matches.find((m) => m.id === matchId) : undefined;

  const players = selected
    ? await prisma.user.findMany({
        where: { role: ROLES.PLAYER, active: true },
        include: { predictions: { where: { matchId: selected.id } } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="mb-1 font-semibold">Pronósticos de los participantes</h2>
        <p className="mb-4 text-sm text-slate-500">
          Registra o corrige el pronóstico de un jugador (por ejemplo, partidos jugados
          antes de poner en marcha la polla). Toda corrección debe informarse al grupo
          (ver LINEAMIENTOS).
        </p>
        <div className="max-w-xl">
          <label htmlFor="match" className="mb-1 block text-sm font-medium">
            Partido
          </label>
          <MatchPicker
            value={selected?.id}
            upcoming={matches
              .filter((m) => m.status !== MATCH_STATUS.FINISHED)
              .map((m) => ({
                id: m.id,
                label: `${m.teamA.name} vs ${m.teamB.name} — ${fmtKickoff(m.kickoff)}`,
              }))}
            finished={matches
              .filter((m) => m.status === MATCH_STATUS.FINISHED)
              .map((m) => ({
                id: m.id,
                label: `[${m.scoreA}-${m.scoreB}] ${m.teamA.name} vs ${m.teamB.name} — ${fmtKickoff(m.kickoff)}`,
              }))}
          />
        </div>
      </section>

      {selected && (
        <section className="card overflow-x-auto p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <div className="font-medium">
              <TeamFlag code={selected.teamA.code} fallback={selected.teamA.flag} />{" "}
              {selected.teamA.name} <span className="text-slate-400">vs</span>{" "}
              <TeamFlag code={selected.teamB.code} fallback={selected.teamB.flag} />{" "}
              {selected.teamB.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {PHASE_LABELS[selected.phase]}
              {selected.groupName ? ` · Grupo ${selected.groupName}` : ""} ·{" "}
              {fmtKickoff(selected.kickoff)}
              {selected.status === MATCH_STATUS.FINISHED ? (
                <span className="badge bg-emerald-100 text-emerald-700">
                  Finalizado {selected.scoreA} - {selected.scoreB}
                </span>
              ) : (
                <span className="badge bg-blue-100 text-blue-700">Programado</span>
              )}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Participante</th>
                <th className="px-4 py-3">Pronóstico actual</th>
                <th className="px-4 py-3 text-center">Puntos</th>
                <th className="px-4 py-3 text-right">Registrar / corregir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {players.map((u) => {
                const mine = u.predictions[0];
                const finished =
                  selected.status === MATCH_STATUS.FINISHED &&
                  selected.scoreA !== null &&
                  selected.scoreB !== null;
                const pts =
                  finished && mine
                    ? pointsFor(
                        { a: mine.predA, b: mine.predB },
                        { a: selected.scoreA!, b: selected.scoreB! }
                      )
                    : null;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">
                      {u.name}
                      <span className="ml-2 text-xs text-slate-400">@{u.username}</span>
                    </td>
                    <td className="px-4 py-3">
                      {mine ? (
                        `${mine.predA} - ${mine.predB}`
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700">Sin pronóstico</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pts === null ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span
                          className={`badge ${
                            pts === 5
                              ? "bg-emerald-100 text-emerald-700"
                              : pts === 3
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {pts} pts
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <AdminPredictionForm
                          userId={u.id}
                          matchId={selected.id}
                          initialA={mine?.predA}
                          initialB={mine?.predB}
                        />
                        {mine && (
                          <form action={deleteUserPrediction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="matchId" value={selected.id} />
                            <ConfirmButton confirmLabel="¿Quitar pronóstico?">
                              Quitar
                            </ConfirmButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No hay participantes activos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
