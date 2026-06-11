# ⚽ Polla Mundialista 2026

Portal web para administrar una polla (quiniela) del Mundial 2026: gestión de
partidos y resultados, registro de pronósticos y tabla de posiciones en vivo.

Las reglas del juego están en [LINEAMIENTOS.md](./LINEAMIENTOS.md).

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io/) + PostgreSQL ([Neon](https://neon.tech))
- [Tailwind CSS 4](https://tailwindcss.com/)
- Autenticación propia con sesiones JWT en cookie (`jose` + `bcryptjs`)

## Puesta en marcha

1. Crea una base PostgreSQL en [Neon](https://neon.tech) (o desde Vercel,
   ver sección de despliegue) y copia la connection string **pooled** en
   `DATABASE_URL` del archivo `.env` (usa `.env.example` como plantilla).
2. Luego:

```bash
npm install          # instalar dependencias (genera el cliente Prisma)
npm run db:push      # crear las tablas en Neon
npm run db:seed      # datos de ejemplo (admin, equipos clasificados, partidos demo)
npm run dev          # http://localhost:3000
```

### Credenciales del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `juan` | `polla2026` | Participante |
| `maria` | `polla2026` | Participante |

> ⚠️ Cambia la contraseña del admin y el `SESSION_SECRET` del archivo `.env`
> antes de usar el portal con tu grupo. El seed incluye los **42 equipos
> clasificados** al Mundial 2026 con sus banderas (los 6 cupos de repechaje se
> agregan desde el panel); los partidos y grupos del seed son **datos demo**:
> elimínalos y registra el fixture real desde **Administración → Partidos**.

## Funcionalidades

### Participantes
- **Inicio**: próximos partidos y top 5 de la polla.
- **Mis predicciones**: registrar/editar el marcador pronosticado de cada
  partido hasta 5 minutos antes de su inicio; historial con puntos obtenidos.
- **Modo oscuro**: toggle ☀️/🌙 persistente (respeta la preferencia del sistema).
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

## Despliegue en Vercel

1. **Sube el repo a GitHub** y en [vercel.com](https://vercel.com) crea un
   proyecto importándolo (framework: Next.js, sin configuración extra — el
   `build` ya ejecuta `prisma generate`).
2. **Crea la base de datos**: en el proyecto de Vercel → pestaña **Storage** →
   *Create Database* → **Neon (Postgres)**. Vercel inyecta `DATABASE_URL`
   automáticamente como variable de entorno.
3. **Agrega la variable `SESSION_SECRET`**: Settings → Environment Variables →
   `SESSION_SECRET` con un valor largo y aleatorio (usa el de tu `.env`).
4. **Crea las tablas y el seed** desde tu máquina, apuntando a Neon
   (con la `DATABASE_URL` de producción en tu `.env` local):

   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Redespliega si es necesario y entra con `admin / admin123` —
   **cambia esa contraseña de inmediato** desde Administración → Participantes.

> Nota: usa siempre la connection string **pooled** de Neon (host con
> `-pooler`), que es la recomendada para entornos serverless como Vercel.

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
