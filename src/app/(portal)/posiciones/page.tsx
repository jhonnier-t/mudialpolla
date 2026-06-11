import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildLeaderboard } from "@/lib/scoring";
import { MATCH_STATUS } from "@/lib/constants";

export default async function PosicionesPage() {
  const session = (await getSession())!;

  const preds = await prisma.prediction.findMany({
    where: { match: { status: MATCH_STATUS.FINISHED } },
    include: { user: true, match: true },
  });

  const finishedCount = await prisma.match.count({
    where: { status: MATCH_STATUS.FINISHED },
  });

  const rows = buildLeaderboard(
    preds
      .filter((p) => p.match.scoreA !== null && p.match.scoreB !== null && p.user.active)
      .map((p) => ({
        userId: p.userId,
        userName: p.user.name,
        username: p.user.username,
        predA: p.predA,
        predB: p.predB,
        scoreA: p.match.scoreA!,
        scoreB: p.match.scoreB!,
      }))
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Tabla de posiciones</h1>
      <p className="mb-4 text-sm text-slate-500">
        {finishedCount} partido{finishedCount === 1 ? "" : "s"} finalizado
        {finishedCount === 1 ? "" : "s"} · Marcador exacto: 5 pts · Resultado acertado: 3 pts
      </p>

      {rows.length === 0 ? (
        <div className="card text-sm text-slate-500">
          La tabla aparecerá cuando finalice el primer partido con pronósticos.
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Participante</th>
                <th className="px-4 py-3 text-center">Exactos</th>
                <th className="px-4 py-3 text-center">Resultados</th>
                <th className="px-4 py-3 text-center">Pronósticos</th>
                <th className="px-4 py-3 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr
                  key={row.userId}
                  className={row.userId === session.userId ? "bg-emerald-50/60" : undefined}
                >
                  <td className="px-4 py-3 font-semibold text-slate-400">
                    {i === 0 ? "🏆" : i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {row.name}
                    <span className="ml-2 text-xs text-slate-400">@{row.username}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{row.exactHits}</td>
                  <td className="px-4 py-3 text-center">{row.outcomeHits}</td>
                  <td className="px-4 py-3 text-center">{row.predictionsCount}</td>
                  <td className="px-4 py-3 text-right text-base font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
