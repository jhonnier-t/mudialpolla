// Valores controlados para campos String del esquema (SQLite no soporta enums)

export const ROLES = {
  ADMIN: "ADMIN",
  PLAYER: "PLAYER",
} as const;

export const MATCH_STATUS = {
  SCHEDULED: "SCHEDULED",
  FINISHED: "FINISHED",
} as const;

export const PHASES = {
  GROUP: "GROUP",
  R32: "R32",
  R16: "R16",
  QF: "QF",
  SF: "SF",
  THIRD: "THIRD",
  FINAL: "FINAL",
} as const;

export const PHASE_LABELS: Record<string, string> = {
  GROUP: "Fase de grupos",
  R32: "Dieciseisavos de final",
  R16: "Octavos de final",
  QF: "Cuartos de final",
  SF: "Semifinal",
  THIRD: "Tercer puesto",
  FINAL: "Final",
};

// Los pronósticos se cierran N minutos antes del inicio del partido
export const PREDICTION_LOCK_MINUTES = 5;

// Sistema de puntuación (ver LINEAMIENTOS.md)
export const POINTS = {
  EXACT: 5, // marcador exacto
  OUTCOME: 3, // acierta ganador o empate (sin marcador exacto)
  MISS: 0,
} as const;
