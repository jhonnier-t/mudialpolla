"use client";

import { useActionState, useEffect } from "react";
import { setResult } from "@/lib/actions/admin";
import { useToast } from "@/components/Toast";

type Props = {
  matchId: string;
  initialA?: number | null;
  initialB?: number | null;
};

export function ResultForm({ matchId, initialA, initialB }: Props) {
  const [state, formAction, pending] = useActionState(setResult, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) toast("success", "Resultado registrado: la tabla ya se actualizó");
    if (state?.error) toast("error", state.error);
  }, [state, toast]);

  return (
    <form action={formAction} className="flex items-center gap-2">
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
    </form>
  );
}
