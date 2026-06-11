import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtKickoff } from "@/lib/format";
import { pointsFor } from "@/lib/scoring";
import { MATCH_STATUS, PHASE_LABELS } from "@/lib/constants";
import { PredictionForm } from "@/components/PredictionForm";

export default async function PrediccionesPage() {
  const session = (await getSession())!;
  const now = new Date();

  const matches = await prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
      predictions: { where: { userId: session.userId } },
    },
    orderBy: { kickoff: "asc" },
  });

  const open = matches.filter((m) => m.status === MATCH_STATUS.SCHEDULED && m.kickoff > now);
  const closed = matches.filter((m) => m.status === MATCH_STATUS.FINISHED || m.kickoff <= now);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-1 text-2xl font-bold">Mis predicciones</h1>
        <p className="mb-4 text-sm text-slate-500">
          Puedes registrar o cambiar tu pronóstico hasta el inicio de cada partido.
        </p>

        {open.length === 0 ? (
          <div className="card text-sm text-slate-500">
            No hay partidos abiertos para pronosticar.
          </div>
        ) : (
          <div className="space-y-3">
            {open.map((m) => {
              const mine = m.predictions[0];
              return (
                <div
                  key={m.id}
                  className="card flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">
                      {m.teamA.flag} {m.teamA.name} <span className="text-slate-400">vs</span>{" "}
                      {m.teamB.flag} {m.teamB.name}
                    </div>
                    <div className="text-xs text-slate-500">
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
                  <th className="px-4 py-3">Resultado</th>
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
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-3">
                        {m.teamA.flag} {m.teamA.name} vs {m.teamB.flag} {m.teamB.name}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {finished ? `${m.scoreA} - ${m.scoreB}` : "En juego / pendiente"}
                      </td>
                      <td className="px-4 py-3">
                        {mine ? `${mine.predA} - ${mine.predB}` : "Sin pronóstico"}
                      </td>
                      <td className="px-4 py-3 text-right">
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
