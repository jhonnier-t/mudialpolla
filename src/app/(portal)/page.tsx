import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { fmtKickoff } from "@/lib/format";
import { buildLeaderboard } from "@/lib/scoring";
import { MATCH_STATUS, PHASE_LABELS, ROLES } from "@/lib/constants";
import { TeamFlag } from "@/components/TeamFlag";

export default async function DashboardPage() {
  const session = await requireSession();
  const isAdmin = session.role === ROLES.ADMIN;

  const [upcoming, finishedPreds, myPredictions] = await Promise.all([
    prisma.match.findMany({
      where: { status: MATCH_STATUS.SCHEDULED, kickoff: { gte: new Date() } },
      include: { teamA: true, teamB: true },
      orderBy: { kickoff: "asc" },
      take: 5,
    }),
    prisma.prediction.findMany({
      where: { match: { status: MATCH_STATUS.FINISHED } },
      include: { user: true, match: true },
    }),
    prisma.prediction.count({ where: { userId: session.userId } }),
  ]);

  const leaderboard = buildLeaderboard(
    finishedPreds
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
  ).slice(0, 5);

  const myRank = leaderboard.findIndex((r) => r.userId === session.userId);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hola, {session.name} 👋</h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? (
            <>Administras la polla: registra los resultados al final de cada partido.</>
          ) : (
            <>
              Llevas {myPredictions} pronóstico{myPredictions === 1 ? "" : "s"} registrado
              {myPredictions === 1 ? "" : "s"}
              {myRank >= 0 && <> · vas en el puesto #{myRank + 1}</>}
            </>
          )}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Próximos partidos</h2>
            {isAdmin ? (
              <Link
                href="/admin/partidos"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Administrar →
              </Link>
            ) : (
              <Link
                href="/predicciones"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Pronosticar →
              </Link>
            )}
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">No hay partidos programados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      <TeamFlag code={m.teamA.code} fallback={m.teamA.flag} />
                      <span className="truncate">{m.teamA.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">vs</span>
                      <TeamFlag code={m.teamB.code} fallback={m.teamB.flag} />
                      <span className="truncate">{m.teamB.name}</span>
                    </span>
                    <span className="badge shrink-0 bg-blue-100 text-blue-700">
                      {fmtKickoff(m.kickoff)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {PHASE_LABELS[m.phase]}
                    {m.groupName ? ` · Grupo ${m.groupName}` : ""}
                    {m.stadium ? ` · ${m.stadium}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Top 5 de la polla</h2>
            <Link
              href="/posiciones"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Ver tabla →
            </Link>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay partidos finalizados con pronósticos.
            </p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {leaderboard.map((row, i) => (
                <li key={row.userId} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-6 shrink-0 text-center font-semibold text-slate-400">
                      {medals[i] ?? i + 1}
                    </span>
                    <span className="truncate font-medium">{row.name}</span>
                    {row.userId === session.userId && (
                      <span className="badge shrink-0 bg-emerald-100 text-emerald-700">tú</span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      {row.exactHits} exacto{row.exactHits === 1 ? "" : "s"}
                    </span>
                    <span className="badge bg-slate-100 font-bold text-slate-700">
                      {row.points} pts
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
