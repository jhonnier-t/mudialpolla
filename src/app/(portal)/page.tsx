import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtKickoff } from "@/lib/format";
import { buildLeaderboard } from "@/lib/scoring";
import { MATCH_STATUS, PHASE_LABELS } from "@/lib/constants";

export default async function DashboardPage() {
  const session = (await getSession())!;

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
  ).slice(0, 5);

  const myRank = leaderboard.findIndex((r) => r.userId === session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hola, {session.name} 👋</h1>
        <p className="text-sm text-slate-500">
          Llevas {myPredictions} pronóstico{myPredictions === 1 ? "" : "s"} registrado
          {myPredictions === 1 ? "" : "s"}
          {myRank >= 0 && <> · vas en el puesto #{myRank + 1}</>}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Próximos partidos</h2>
            <Link href="/predicciones" className="text-sm font-medium text-emerald-700 hover:underline">
              Pronosticar →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">No hay partidos programados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    {m.teamA.flag} {m.teamA.name} <span className="text-slate-400">vs</span>{" "}
                    {m.teamB.flag} {m.teamB.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {PHASE_LABELS[m.phase]}
                    {m.groupName ? ` · Grupo ${m.groupName}` : ""} · {fmtKickoff(m.kickoff)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Top 5 de la polla</h2>
            <Link href="/posiciones" className="text-sm font-medium text-emerald-700 hover:underline">
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
                <li key={row.userId} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    <span className="mr-2 font-semibold text-slate-400">#{i + 1}</span>
                    {row.name}
                    {row.userId === session.userId && (
                      <span className="badge ml-2 bg-emerald-100 text-emerald-700">tú</span>
                    )}
                  </span>
                  <span className="font-semibold">{row.points} pts</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
