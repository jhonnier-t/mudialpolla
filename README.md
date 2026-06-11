# ⚽ Polla Mundialista 2026

Portal web para administrar una polla (quiniela) del Mundial 2026: gestión de
partidos y resultados, registro de pronósticos y tabla de posiciones en vivo.

Las reglas del juego están en [LINEAMIENTOS.md](./LINEAMIENTOS.md).

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite (migrable a PostgreSQL cambiando el datasource)
- [Tailwind CSS 4](https://tailwindcss.com/)
- Autenticación propia con sesiones JWT en cookie (`jose` + `bcryptjs`)

## Puesta en marcha

```bash
npm install          # instalar dependencias
npm run db:push      # crear la base de datos SQLite (prisma/dev.db)
npm run db:seed      # datos de ejemplo (admin, jugadores y partidos demo)
npm run dev          # http://localhost:3000
```

### Credenciales del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `juan` | `polla2026` | Participante |
| `maria` | `polla2026` | Participante |

> ⚠️ Cambia la contraseña del admin y el `SESSION_SECRET` del archivo `.env`
> antes de usar el portal con tu grupo. Los partidos del seed son **datos demo**:
> elimínalos y registra el fixture real desde **Administración → Partidos**.

## Funcionalidades

### Participantes
- **Inicio**: próximos partidos y top 5 de la polla.
- **Mis predicciones**: registrar/editar el marcador pronosticado de cada
  partido hasta su hora de inicio; historial con puntos obtenidos.
- **Posiciones**: tabla de la polla (puntos, marcadores exactos, aciertos).

### Administrador (`/admin`)
- **Partidos y resultados**: programar partidos (fase, grupo, fecha, estadio),
  registrar el resultado final, corregirlo (reabrir) o eliminar partidos.
- **Equipos**: CRUD de selecciones (nombre, código FIFA, bandera, grupo).
- **Participantes**: crear usuarios, restablecer contraseñas, activar/desactivar.

## Sistema de puntuación

- Marcador exacto: **5 pts** · Resultado acertado: **3 pts** · Fallo: **0 pts**.
- Configurable en [src/lib/constants.ts](./src/lib/constants.ts) (`POINTS`).
- La lógica de cálculo y desempates vive en [src/lib/scoring.ts](./src/lib/scoring.ts).

## Scripts útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run db:push` | Sincroniza el esquema Prisma con la BD |
| `npm run db:seed` | Carga datos de ejemplo |
| `npm run db:studio` | UI de Prisma para inspeccionar la BD |

## Estructura

```
prisma/schema.prisma          # Modelos: User, Team, Match, Prediction
src/lib/                      # auth (sesiones), scoring (puntos), actions (server actions)
src/app/login/                # Inicio de sesión
src/app/(portal)/             # Dashboard, predicciones y posiciones (requiere sesión)
src/app/(portal)/admin/       # Panel de administración (requiere rol ADMIN)
src/components/               # Formularios cliente (useActionState)
```
