import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-5xl">⚽</div>
          <h1 className="mt-2 text-2xl font-bold">Polla Mundialista 2026</h1>
          <p className="text-sm text-slate-500">Inicia sesión para pronosticar</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
