import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { fmtKickoff } from "@/lib/format";
import { isPredictionOpen, pointsFor, predictionDeadline } from "@/lib/scoring";
import { MATCH_STATUS, PHASE_LABELS, PREDICTION_LOCK_MINUTES, ROLES } from "@/lib/constants";
import { PredictionForm } from "@/components/PredictionForm";
import { TeamFlag } from "@/components/TeamFlag";

export default async function PrediccionesPage() {
  const session = await requireSession();
  if (session.role === ROLES.ADMIN) redirect("/admin/pronosticos");

  const now = new Date();

  const matches = await prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
      predictions: { where: { userId: session.userId } },
    },
    orderBy: { kickoff: "asc" },
  });

  const open = matches.filter(
    (m) => m.status === MATCH_STATUS.SCHEDULED && isPredictionOpen(m.kickoff, now)
  );
  const closed = matches.filter(
    (m) => m.status === MATCH_STATUS.FINISHED || !isPredictionOpen(m.kickoff, now)
  );

  const SOON_MS = 60 * 60 * 1000; // 1 hora

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-1 text-2xl font-bold">Mis predicciones</h1>
        <p className="mb-4 text-sm text-slate-500">
          Puedes registrar o cambiar tu pronóstico hasta {PREDICTION_LOCK_MINUTES} minutos
          antes del inicio de cada partido.
        </p>

        {open.length === 0 ? (
          <div className="card text-sm text-slate-500">
            No hay partidos abiertos para pronosticar.
          </div>
        ) : (
          <div className="space-y-3">
            {open.map((m) => {
              const mine = m.predictions[0];
              const closesSoon =
                predictionDeadline(m.kickoff).getTime() - now.getTime() < SOON_MS;
              return (
                <div
                  key={m.id}
                  className="card flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-emerald-500"
                >
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <TeamFlag code={m.teamA.code} fallback={m.teamA.flag} />
                      {m.teamA.name}
                      <span className="text-xs text-slate-400">vs</span>
                      <TeamFlag code={m.teamB.code} fallback={m.teamB.flag} />
                      {m.teamB.name}
                      {closesSoon ? (
                        <span className="badge bg-amber-100 text-amber-700">⏳ Cierra pronto</span>
                      ) : mine ? (
                        <span className="badge bg-emerald-100 text-emerald-700">✓ Pronosticado</span>
                      ) : (
                        <span className="badge bg-blue-100 text-blue-700">Abierto</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {PHASE_LABELS[m.phase]}
                      {m.groupName ? ` · Grupo ${m.groupName}` : ""} · {fmtKickoff(m.kickoff)}
                      {m.stadium ? ` · ${m.stadium}` : ""}
                    </div>
                  </div>
                  <PredictionForm
                    matchId={m.id}
                    initialA={mine?.predA}
                    initialB={mine?.predB}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Partidos cerrados</h2>
        {closed.length === 0 ? (
          <div className="card text-sm text-slate-500">Aún no hay partidos cerrados.</div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Partido</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Mi pronóstico</th>
                  <th className="px-4 py-3 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closed.map((m) => {
                  const mine = m.predictions[0];
                  const finished =
                    m.status === MATCH_STATUS.FINISHED && m.scoreA !== null && m.scoreB !== null;
                  const pts =
                    finished && mine
                      ? pointsFor(
                          { a: mine.predA, b: mine.predB },
                          { a: m.scoreA!, b: m.scoreB! }
                        )
                      : null;
                  let ptsBadge = "bg-slate-100 text-slate-500";
                  if (pts === 5) ptsBadge = "bg-emerald-100 text-emerald-700";
                  else if (pts === 3) ptsBadge = "bg-amber-100 text-amber-700";
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <TeamFlag code={m.teamA.code} fallback={m.teamA.flag} />
                          {m.teamA.name}
                          <span className="text-xs text-slate-400">vs</span>
                          <TeamFlag code={m.teamB.code} fallback={m.teamB.flag} />
                          {m.teamB.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {finished ? (
                          <span className="badge bg-emerald-100 font-bold text-emerald-700">
                            {m.scoreA} - {m.scoreB}
                          </span>
                        ) : (
                          <span className="badge animate-pulse bg-amber-100 text-amber-700">
                            ● En juego
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {mine ? (
                          `${mine.predA} - ${mine.predB}`
                        ) : (
                          <span className="text-slate-400">Sin pronóstico</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {pts === null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className={`badge ${ptsBadge}`}>{pts} pts</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
