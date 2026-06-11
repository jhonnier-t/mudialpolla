"use client";

import { useActionState } from "react";
import { createTeam } from "@/lib/actions/admin";

export function TeamForm() {
  const [state, formAction, pending] = useActionState(createTeam, null);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input name="name" className="input" placeholder="Colombia" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Código FIFA</label>
        <input name="code" className="input uppercase" placeholder="COL" maxLength={3} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bandera (emoji)</label>
        <input name="flag" className="input" placeholder="🇨🇴" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Grupo</label>
        <input name="groupName" className="input" placeholder="K" maxLength={1} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creando…" : "Agregar equipo"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-emerald-600">Equipo agregado ✓</p>}
      </div>
    </form>
  );
}
