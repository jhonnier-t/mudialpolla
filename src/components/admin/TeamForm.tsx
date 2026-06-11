"use client";

import { useActionState, useEffect } from "react";
import { createTeam } from "@/lib/actions/admin";
import { useToast } from "@/components/Toast";

export function TeamForm() {
  const [state, formAction, pending] = useActionState(createTeam, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) toast("success", "Equipo agregado");
    if (state?.error) toast("error", state.error);
  }, [state, toast]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label htmlFor="team-name" className="mb-1 block text-sm font-medium">
          Nombre
        </label>
        <input id="team-name" name="name" className="input" placeholder="Colombia" required />
      </div>
      <div>
        <label htmlFor="team-code" className="mb-1 block text-sm font-medium">
          Código FIFA
        </label>
        <input
          id="team-code"
          name="code"
          className="input uppercase"
          placeholder="COL"
          maxLength={3}
          required
        />
      </div>
      <div>
        <label htmlFor="team-group" className="mb-1 block text-sm font-medium">
          Grupo
        </label>
        <input id="team-group" name="groupName" className="input" placeholder="K" maxLength={1} />
      </div>
      <p className="self-end pb-2 text-xs text-slate-500">
        La bandera se asigna automáticamente según el código FIFA.
      </p>
      <div className="sm:col-span-2 lg:col-span-4">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creando…" : "Agregar equipo"}
        </button>
      </div>
    </form>
  );
}
