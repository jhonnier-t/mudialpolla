"use client";

import { useActionState } from "react";
import { savePrediction } from "@/lib/actions/predictions";

type Props = {
  matchId: string;
  initialA?: number;
  initialB?: number;
};

export function PredictionForm({ matchId, initialA, initialB }: Props) {
  const [state, formAction, pending] = useActionState(savePrediction, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="matchId" value={matchId} />
        <input
          name="predA"
          type="number"
          min={0}
          max={20}
          defaultValue={initialA ?? ""}
          className="input w-16 text-center"
          aria-label="Goles equipo local"
          required
        />
        <span className="text-slate-400">-</span>
        <input
          name="predB"
          type="number"
          min={0}
          max={20}
          defaultValue={initialB ?? ""}
          className="input w-16 text-center"
          aria-label="Goles equipo visitante"
          required
        />
        <button type="submit" className="btn-primary px-3 py-2" disabled={pending}>
          {pending ? "…" : "Guardar"}
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-600">Pronóstico guardado ✓</p>}
    </form>
  );
}
