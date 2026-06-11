"use client";

import { useActionState } from "react";
import { createMatch } from "@/lib/actions/admin";
import { PHASE_LABELS } from "@/lib/constants";

type TeamOption = { id: string; name: string; flag: string };

export function MatchForm({ teams }: { teams: TeamOption[] }) {
  const [state, formAction, pending] = useActionState(createMatch, null);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Equipo local</label>
        <select name="teamAId" className="input" required defaultValue="">
          <option value="" disabled>
            Selecciona…
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag} {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Equipo visitante</label>
        <select name="teamBId" className="input" required defaultValue="">
          <option value="" disabled>
            Selecciona…
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag} {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Fecha y hora</label>
        <input name="kickoff" type="datetime-local" className="input" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Fase</label>
        <select name="phase" className="input" defaultValue="GROUP">
          {Object.entries(PHASE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Grupo (opcional)</label>
        <input name="groupName" className="input" maxLength={1} placeholder="A" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Estadio (opcional)</label>
        <input name="stadium" className="input" placeholder="Estadio Azteca, CDMX" />
      </div>
      <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creando…" : "Crear partido"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-emerald-600">Partido creado ✓</p>}
      </div>
    </form>
  );
}
