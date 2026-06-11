"use client";

import { useActionState } from "react";
import { createUser } from "@/lib/actions/admin";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre completo</label>
        <input name="name" className="input" placeholder="Juan Pérez" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Usuario</label>
        <input name="username" className="input lowercase" placeholder="juan" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Contraseña</label>
        <input name="password" type="text" className="input" minLength={6} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Rol</label>
        <select name="role" className="input" defaultValue="PLAYER">
          <option value="PLAYER">Participante</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creando…" : "Crear participante"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-emerald-600">Participante creado ✓</p>}
      </div>
    </form>
  );
}
