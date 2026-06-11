import Link from "next/link";
import { prisma } from "@/lib/db";
import { MATCH_STATUS, ROLES } from "@/lib/constants";

export default async function AdminHomePage() {
  const [teams, matches, finished, players, predictions] = await Promise.all([
    prisma.team.count(),
    prisma.match.count(),
    prisma.match.count({ where: { status: MATCH_STATUS.FINISHED } }),
    prisma.user.count({ where: { role: ROLES.PLAYER, active: true } }),
    prisma.prediction.count(),
  ]);

  const stats = [
    { label: "Equipos", value: teams, href: "/admin/equipos" },
    { label: "Partidos", value: matches, href: "/admin/partidos" },
    { label: "Finalizados", value: finished, href: "/admin/partidos" },
    { label: "Participantes activos", value: players, href: "/admin/usuarios" },
    { label: "Pronósticos", value: predictions, href: "/posiciones" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((s) => (
        <Link key={s.label} href={s.href} className="card hover:border-emerald-300">
          <div className="text-3xl font-bold">{s.value}</div>
          <div className="text-sm text-slate-500">{s.label}</div>
        </Link>
      ))}
    </div>
  );
}
