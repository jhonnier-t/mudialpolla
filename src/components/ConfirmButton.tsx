"use client";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
};

/**
 * Botón de acción destructiva en dos pasos: el primer clic "arma" el botón
 * (se vuelve confirmación visible durante 3 s) y el segundo envía el form.
 */
export function ConfirmButton({
  children,
  confirmLabel = "¿Confirmar?",
  className = "btn-danger px-3 py-2",
}: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!armed) {
    return (
      <button type="button" className={className} onClick={() => setArmed(true)}>
        {children}
      </button>
    );
  }
  return (
    <button
      type="submit"
      className="inline-flex animate-pulse items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
    >
      {confirmLabel}
    </button>
  );
}
