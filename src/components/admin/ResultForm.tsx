"use client";

import { useActionState } from "react";
import { setResult } from "@/lib/actions/admin";

type Props = {
  matchId: string;
  initialA?: number | null;
  initialB?: number | null;
};

export function ResultForm({ matchId, initialA, initialB }: Props) {
  const [state, formAction, pending] = useActionState(setResult, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="id" value={matchId} />
        <input
          name="scoreA"
          type="number"
          min={0}
          defaultValue={initialA ?? ""}
          className="input w-16 text-center"
          aria-label="Goles local"
          required
        />
        <span className="text-slate-400">-</span>
        <input
          name="scoreB"
          type="number"
          min={0}
          defaultValue={initialB ?? ""}
          className="input w-16 text-center"
          aria-label="Goles visitante"
          required
        />
        <button type="submit" className="btn-primary px-3 py-2" disabled={pending}>
          {pending ? "…" : "Resultado"}
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-600">Resultado registrado ✓</p>}
    </form>
  );
}
