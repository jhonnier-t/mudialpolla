"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/lib/actions/account";
import { useToast } from "@/components/Toast";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast("success", "Contraseña actualizada correctamente");
      formRef.current?.reset();
    }
    if (state?.error) toast("error", state.error);
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="current" className="mb-1 block text-sm font-medium">
          Contraseña actual
        </label>
        <input
          id="current"
          name="current"
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="next" className="mb-1 block text-sm font-medium">
            Nueva contraseña
          </label>
          <input
            id="next"
            name="next"
            type="password"
            className="input"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
