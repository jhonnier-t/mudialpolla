"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/actions/admin";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={userId} />
      <input
        name="password"
        type="text"
        className="input w-36"
        placeholder="Nueva clave"
        minLength={6}
        required
      />
      <button type="submit" className="btn-secondary px-3 py-2" disabled={pending}>
        {pending ? "…" : "Cambiar"}
      </button>
      {state?.ok && <span className="text-xs text-emerald-600">✓</span>}
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
