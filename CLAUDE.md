# Polla Mundialista 2026

Portal de administración y pronósticos para una polla del Mundial 2026.
Las reglas de negocio (puntuación, bloqueo de pronósticos, desempates) están
en `LINEAMIENTOS.md` — el código debe mantenerse consistente con ese documento.

## Stack

Next.js 15 (App Router, server actions) · React 19 · TypeScript estricto ·
Prisma 6 + SQLite · Tailwind CSS 4 · Sesiones JWT en cookie (`jose` + `bcryptjs`).

## Comandos

```bash
npm run dev        # desarrollo (http://localhost:3000)
npm run build      # build de producción (úsalo para verificar tipos)
npm run db:push    # sincronizar schema.prisma con la BD SQLite
npm run db:seed    # datos demo (admin/admin123, juan y maria/polla2026)
npm run db:studio  # inspeccionar la BD
```

## Arquitectura

- `prisma/schema.prisma` — modelos User, Team, Match, Prediction. SQLite no
  soporta enums: los campos `role`, `phase` y `status` son String con valores
  controlados en `src/lib/constants.ts`. Usa siempre esas constantes.
- `src/lib/auth.ts` — sesión JWT en cookie httpOnly (`polla_session`).
  `getSession()` está cacheado por request.
- `src/lib/scoring.ts` — cálculo de puntos y tabla de posiciones. Los puntos
  NO se persisten: se calculan al vuelo desde pronósticos + resultados.
- `src/lib/actions/` — todas las mutaciones son server actions. Las de
  `admin.ts` exigen rol ADMIN vía `requireAdmin()`.
- `src/app/(portal)/` — rutas con sesión obligatoria (guard en el layout).
  `(portal)/admin/` exige además rol ADMIN (guard en su propio layout).
- `src/components/` — componentes cliente con `useActionState` para formularios.

## Reglas de negocio clave (no romper)

- Un pronóstico solo se puede crear/editar si `match.kickoff > now` y el
  partido no está FINISHED (validado en `savePrediction`).
- Marcador exacto = 5 pts, resultado acertado = 3 pts (constante `POINTS`).
- Desempate de la tabla: puntos → marcadores exactos → nombre.
- Usuarios inactivos no aparecen en la tabla de posiciones.
- Nadie edita pronósticos ajenos, ni siquiera el admin.

## Convenciones

- UI y mensajes en español; código (identificadores) en inglés.
- Fechas mostradas en hora de Colombia (`src/lib/format.ts`, es-CO).
- Después de mutaciones admin, revalidar rutas con `revalidateAll()` de
  `src/lib/actions/admin.ts`.
