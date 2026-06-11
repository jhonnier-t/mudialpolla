/**
 * Tabla de posiciones de los grupos del mundial calculada a partir de un
 * conjunto de resultados (reales o pronosticados por un usuario).
 *
 * Desempate simplificado: puntos → diferencia de gol → goles a favor →
 * nombre. (El reglamento FIFA completo incluye enfrentamiento directo y
 * fair play, que no aplican con datos parciales.)
 */

export type StandingTeam = {
  id: string;
  name: string;
  code: string;
  flag: string;
  groupName: string;
};

export type StandingResult = {
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
};

export type StandingRow = {
  teamId: string;
  name: string;
  code: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

export function computeGroupStandings(
  teams: StandingTeam[],
  results: StandingResult[]
): Map<string, StandingRow[]> {
  const rowByTeam = new Map<string, StandingRow>();
  for (const t of teams) {
    rowByTeam.set(t.id, {
      teamId: t.id,
      name: t.name,
      code: t.code,
      flag: t.flag,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    });
  }

  for (const r of results) {
    const a = rowByTeam.get(r.teamAId);
    const b = rowByTeam.get(r.teamBId);
    if (!a || !b) continue; // equipo fuera de grupos (no debería pasar en fase de grupos)
    a.played++;
    b.played++;
    a.gf += r.scoreA;
    a.ga += r.scoreB;
    b.gf += r.scoreB;
    b.ga += r.scoreA;
    if (r.scoreA > r.scoreB) {
      a.won++;
      b.lost++;
      a.pts += 3;
    } else if (r.scoreA < r.scoreB) {
      b.won++;
      a.lost++;
      b.pts += 3;
    } else {
      a.drawn++;
      b.drawn++;
      a.pts++;
      b.pts++;
    }
  }

  for (const row of rowByTeam.values()) row.gd = row.gf - row.ga;

  const byGroup = new Map<string, StandingRow[]>();
  for (const t of teams) {
    const rows = byGroup.get(t.groupName) ?? [];
    rows.push(rowByTeam.get(t.id)!);
    byGroup.set(t.groupName, rows);
  }
  for (const rows of byGroup.values()) {
    rows.sort(
      (x, y) =>
        y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name)
    );
  }
  return new Map([...byGroup.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
