import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtKickoff } from "@/lib/format";
import { predictionDeadline } from "@/lib/scoring";
import { MATCH_STATUS, PREDICTION_LOCK_MINUTES, ROLES } from "@/lib/constants";
import { TeamFlag } from "@/components/TeamFlag";

const URGENT_MS = 2 * 60 * 60 * 1000; // 2 horas

/**
 * Alerta visible en todo el portal: el próximo partido aún abierto para el
 * que el jugador no ha registrado pronóstico. No aplica al admin.
 */
export async function PredictionReminder() {
  const session = await getSession();
  if (!session || session.role === ROLES.ADMIN) return null;

  const now = new Date();
  const next = await prisma.match.findFirst({
    where: {
      status: MATCH_STATUS.SCHEDULED,
      // todavía se puede pronosticar (no ha llegado el cierre de 5 minutos)
      kickoff: { gt: new Date(now.getTime() + PREDICTION_LOCK_MINUTES * 60_000) },
      predictions: { none: { userId: session.userId } },
    },
    include: { teamA: true, teamB: true },
    orderBy: { kickoff: "asc" },
  });
  if (!next) return null;

  const urgent = predictionDeadline(next.kickoff).getTime() - now.getTime() < URGENT_MS;
  const tone = urgent
    ? "border-red-700/10 bg-red-100 text-red-700"
    : "border-amber-700/10 bg-amber-100 text-amber-700";

  return (
    <div
      role="alert"
      className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${tone}`}
    >
      <span className="flex flex-wrap items-center gap-2">
        <span aria-hidden>{urgent ? "🚨" : "⏰"}</span>
        <span>
          {urgent ? "¡Última oportunidad!" : "Te falta pronosticar:"}{" "}
          <strong className="inline-flex items-center gap-1.5">
            <TeamFlag code={next.teamA.code} fallback={next.teamA.flag} />
            {next.teamA.name} vs <TeamFlag code={next.teamB.code} fallback={next.teamB.flag} />
            {next.teamB.name}
          </strong>{" "}
          — {fmtKickoff(next.kickoff)} (se cierra {PREDICTION_LOCK_MINUTES} min antes).
        </span>
      </span>
      <Link
        href="/predicciones"
        className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold text-white ${
          urgent ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        Pronosticar →
      </Link>
    </div>
  );
}
