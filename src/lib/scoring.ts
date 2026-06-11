import { POINTS } from "./constants";

type Score = { a: number; b: number };

/** Puntos de un pronóstico frente al resultado real (ver LINEAMIENTOS.md). */
export function pointsFor(pred: Score, result: Score): number {
  if (pred.a === result.a && pred.b === result.b) return POINTS.EXACT;
  const predOutcome = Math.sign(pred.a - pred.b);
  const realOutcome = Math.sign(result.a - result.b);
  return predOutcome === realOutcome ? POINTS.OUTCOME : POINTS.MISS;
}

export type LeaderboardRow = {
  userId: string;
  name: string;
  username: string;
  points: number;
  exactHits: number;
  outcomeHits: number;
  predictionsCount: number;
};

type FinishedPrediction = {
  userId: string;
  userName: string;
  username: string;
  predA: number;
  predB: number;
  scoreA: number;
  scoreB: number;
};

/**
 * Tabla de posiciones a partir de pronósticos de partidos finalizados.
 * Orden: puntos desc → marcadores exactos desc → nombre asc (desempate final
 * por orden alfabético; el premio compartido se define en LINEAMIENTOS.md).
 */
export function buildLeaderboard(rows: FinishedPrediction[]): LeaderboardRow[] {
  const byUser = new Map<string, LeaderboardRow>();
  for (const r of rows) {
    const entry = byUser.get(r.userId) ?? {
      userId: r.userId,
      name: r.userName,
      username: r.username,
      points: 0,
      exactHits: 0,
      outcomeHits: 0,
      predictionsCount: 0,
    };
    const pts = pointsFor({ a: r.predA, b: r.predB }, { a: r.scoreA, b: r.scoreB });
    entry.points += pts;
    if (pts === POINTS.EXACT) entry.exactHits++;
    if (pts === POINTS.OUTCOME) entry.outcomeHits++;
    entry.predictionsCount++;
    byUser.set(r.userId, entry);
  }
  return [...byUser.values()].sort(
    (x, y) =>
      y.points - x.points ||
      y.exactHits - x.exactHits ||
      x.name.localeCompare(y.name)
  );
}
