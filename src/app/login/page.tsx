import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-5xl">⚽</div>
          <h1 className="mt-2 text-2xl font-bold">Polla Mundialista 2026</h1>
          <p className="text-sm text-slate-500">Inicia sesión para pronosticar</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Desarrollado por{" "}
          <a
            href="mailto:jhonnier98t@gmail.com"
            className="font-medium text-slate-500 hover:text-emerald-700"
          >
            Jhonnier Tangarife
          </a>
        </p>
      </div>
    </main>
  );
}
