import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { computeGroupStandings, type StandingResult } from "@/lib/standings";
import { MATCH_STATUS, PHASES, ROLES } from "@/lib/constants";
import { TeamFlag } from "@/components/TeamFlag";

type Props = { searchParams: Promise<{ vista?: string }> };

export default async function GruposPage({ searchParams }: Props) {
  const session = await requireSession();
  const isAdmin = session.role === ROLES.ADMIN;
  const { vista } = await searchParams;
  const useMine = vista === "mios" && !isAdmin;

  const [teams, matches] = await Promise.all([
    prisma.team.findMany({ where: { groupName: { not: null } } }),
    prisma.match.findMany({
      where: { phase: PHASES.GROUP },
      include: {
        predictions: useMine ? { where: { userId: session.userId } } : false,
      },
    }),
  ]);

  // Resultados a usar: reales, o (en "mis pronósticos") el pronóstico del
  // usuario donde exista y el resultado real para lo ya jugado sin pronóstico.
  const results: StandingResult[] = [];
  let predicted = 0;
  for (const m of matches) {
    const finished =
      m.status === MATCH_STATUS.FINISHED && m.scoreA !== null && m.scoreB !== null;
    if (useMine) {
      const mine = (m as { predictions?: { predA: number; predB: number }[] })
        .predictions?.[0];
      if (mine) {
        results.push({ teamAId: m.teamAId, teamBId: m.teamBId, scoreA: mine.predA, scoreB: mine.predB });
        predicted++;
        continue;
      }
    }
    if (finished) {
      results.push({ teamAId: m.teamAId, teamBId: m.teamBId, scoreA: m.scoreA!, scoreB: m.scoreB! });
    }
  }

  const standings = computeGroupStandings(
    teams.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      flag: t.flag,
      groupName: t.groupName!,
    })),
    results
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Grupos del Mundial</h1>
          <p className="text-sm text-slate-500">
            {useMine ? (
              <>
                Así quedarían los grupos si tus {predicted} pronóstico
                {predicted === 1 ? "" : "s"} se cumplen (lo demás usa resultados reales).
              </>
            ) : (
              <>Posiciones según los resultados oficiales registrados.</>
            )}
          </p>
        </div>
        {!isAdmin && (
          <div className="flex gap-1 rounded-xl border border-slate-200/80 bg-white p-1 text-sm font-medium">
            <Link
              href="/grupos"
              className={`rounded-lg px-3 py-1.5 ${
                !useMine ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Reales
            </Link>
            <Link
              href="/grupos?vista=mios"
              className={`rounded-lg px-3 py-1.5 ${
                useMine ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Mis pronósticos
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...standings.entries()].map(([group, rows]) => (
          <section key={group} className="card p-0">
            <h2 className="border-b border-slate-200/80 px-4 py-2.5 text-sm font-semibold">
              Grupo {group}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-center text-[11px] uppercase text-slate-400">
                  <th className="py-1.5 pl-4 text-left font-medium">Equipo</th>
                  <th className="w-8 font-medium" title="Partidos jugados">PJ</th>
                  <th className="w-8 font-medium" title="Ganados">G</th>
                  <th className="w-8 font-medium" title="Empatados">E</th>
                  <th className="w-8 font-medium" title="Perdidos">P</th>
                  <th className="w-10 font-medium" title="Diferencia de gol">DG</th>
                  <th className="w-10 pr-4 font-medium" title="Puntos">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <tr key={row.teamId} className="text-center">
                    <td className="py-2 pl-4 text-left">
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-block h-4 w-1 rounded-full ${
                            i < 2
                              ? "bg-emerald-500"
                              : i === 2
                                ? "bg-amber-400"
                                : "bg-transparent"
                          }`}
                          aria-hidden
                        />
                        <TeamFlag code={row.code} fallback={row.flag} />
                        <span className="truncate font-medium">{row.name}</span>
                      </span>
                    </td>
                    <td className="text-slate-500">{row.played}</td>
                    <td className="text-slate-500">{row.won}</td>
                    <td className="text-slate-500">{row.drawn}</td>
                    <td className="text-slate-500">{row.lost}</td>
                    <td className={row.gd > 0 ? "text-emerald-600" : row.gd < 0 ? "text-red-500" : "text-slate-500"}>
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </td>
                    <td className="pr-4 font-bold">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        <span className="mr-1 inline-block h-3 w-1 rounded-full bg-emerald-500 align-middle" />
        1.º y 2.º clasifican a dieciseisavos ·
        <span className="mx-1 inline-block h-3 w-1 rounded-full bg-amber-400 align-middle" />
        los 8 mejores terceros también avanzan · Desempate simplificado: puntos,
        diferencia de gol y goles a favor.
      </p>
    </div>
  );
}
