import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Configuration du pool de connexion PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Déclaration du type global pour le Singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Instanciation du client avec l'adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// 4. Stockage dans le global en développement
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
