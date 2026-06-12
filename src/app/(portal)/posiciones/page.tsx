import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { buildLeaderboard } from "@/lib/scoring";
import { MATCH_STATUS, ROLES } from "@/lib/constants";

export default async function PosicionesPage() {
  const session = await requireSession();

  const preds = await prisma.prediction.findMany({
    where: { match: { status: MATCH_STATUS.FINISHED } },
    include: { user: true, match: true },
  });

  const finishedCount = await prisma.match.count({
    where: { status: MATCH_STATUS.FINISHED },
  });

  const rows = buildLeaderboard(
    preds
      .filter(
        (p) =>
          p.match.scoreA !== null &&
          p.match.scoreB !== null &&
          p.user.active &&
          p.user.role === ROLES.PLAYER
      )
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
                <th className="hidden px-4 py-3 text-center sm:table-cell">Pronósticos</th>
                <th className="px-4 py-3 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const podium = [
                  "bg-amber-100/50",
                  "bg-slate-100/70",
                  "bg-orange-100/40",
                ];
                const isMe = row.userId === session.userId;
                return (
                  <tr
                    key={row.userId}
                    className={isMe ? "bg-emerald-50/60" : (podium[i] ?? undefined)}
                  >
                    <td className="px-4 py-3 text-base font-semibold text-slate-400">
                      {medals[i] ?? i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {row.name}
                      {isMe && (
                        <span className="badge ml-2 bg-emerald-100 text-emerald-700">tú</span>
                      )}
                      <span className="ml-2 text-xs text-slate-400">@{row.username}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge bg-emerald-100 text-emerald-700">
                        {row.exactHits}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge bg-amber-100 text-amber-700">
                        {row.outcomeHits}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center text-slate-500 sm:table-cell">
                      {row.predictionsCount}
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold">{row.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
