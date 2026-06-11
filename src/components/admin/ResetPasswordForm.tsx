"use client";

import { useActionState, useEffect } from "react";
import { resetPassword } from "@/lib/actions/admin";
import { useToast } from "@/components/Toast";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) toast("success", "Contraseña actualizada");
    if (state?.error) toast("error", state.error);
  }, [state, toast]);

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
    </form>
  );
}
