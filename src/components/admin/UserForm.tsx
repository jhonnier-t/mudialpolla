"use client";

import { useActionState, useEffect } from "react";
import { createUser } from "@/lib/actions/admin";
import { useToast } from "@/components/Toast";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) toast("success", "Participante creado");
    if (state?.error) toast("error", state.error);
  }, [state, toast]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label htmlFor="user-name" className="mb-1 block text-sm font-medium">
          Nombre completo
        </label>
        <input id="user-name" name="name" className="input" placeholder="Juan Pérez" required />
      </div>
      <div>
        <label htmlFor="user-username" className="mb-1 block text-sm font-medium">
          Usuario
        </label>
        <input
          id="user-username"
          name="username"
          className="input lowercase"
          placeholder="juan"
          required
        />
      </div>
      <div>
        <label htmlFor="user-password" className="mb-1 block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="user-password"
          name="password"
          type="text"
          className="input"
          minLength={6}
          required
        />
      </div>
      <div>
        <label htmlFor="user-role" className="mb-1 block text-sm font-medium">
          Rol
        </label>
        <select id="user-role" name="role" className="input" defaultValue="PLAYER">
          <option value="PLAYER">Participante</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creando…" : "Crear participante"}
        </button>
      </div>
    </form>
  );
}
