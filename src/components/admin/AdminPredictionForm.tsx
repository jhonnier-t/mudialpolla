"use client";

import { useActionState, useEffect } from "react";
import { setUserPrediction } from "@/lib/actions/admin";
import { useToast } from "@/components/Toast";

type Props = {
  userId: string;
  matchId: string;
  initialA?: number;
  initialB?: number;
};

export function AdminPredictionForm({ userId, matchId, initialA, initialB }: Props) {
  const [state, formAction, pending] = useActionState(setUserPrediction, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) toast("success", "Pronóstico del participante guardado");
    if (state?.error) toast("error", state.error);
  }, [state, toast]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
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
    </form>
  );
}
