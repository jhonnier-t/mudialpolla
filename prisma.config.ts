// Configuración del CLI de Prisma (reemplaza el bloque "prisma" de package.json).
// Con este archivo presente, el CLI ya no carga .env automáticamente:
// el import de dotenv lo hace explícito.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
