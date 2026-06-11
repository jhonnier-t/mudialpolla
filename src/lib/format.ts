const dateFmt = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Fecha/hora de un partido en hora de Colombia, ej: "jue., 11 jun, 19:00". */
export function fmtKickoff(d: Date): string {
  return dateFmt.format(d);
}
