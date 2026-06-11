"use client";

import { useRouter } from "next/navigation";

export type MatchOption = { id: string; label: string };

type Props = {
  upcoming: MatchOption[];
  finished: MatchOption[];
  value?: string;
};

/**
 * Selector de partido controlado por la URL: al elegir, navega a
 * ?match=<id>. Controlado (value) para que el select nunca se desincronice
 * de lo que se muestra, y sin submit (evita el bug de la rueda del mouse
 * sobre el select enfocado que recorría las opciones).
 */
export function MatchPicker({ upcoming, finished, value }: Props) {
  const router = useRouter();

  return (
    <select
      id="match"
      className="input"
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value) router.push(`/admin/pronosticos?match=${e.target.value}`);
      }}
      onWheel={(e) => (e.target as HTMLSelectElement).blur()}
    >
      <option value="" disabled>
        Selecciona un partido…
      </option>
      {upcoming.length > 0 && (
        <optgroup label="Próximos">
          {upcoming.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </optgroup>
      )}
      {finished.length > 0 && (
        <optgroup label="Finalizados">
          {finished.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
