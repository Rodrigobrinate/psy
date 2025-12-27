/**
 * Prisma Client Singleton
 * Garante apenas uma instância do PrismaClient para evitar esgotamento de conexões
 */

import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Cria pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cria adapter
const adapter = new PrismaPg(pool);

// Cria Prisma Client com adapter
export const prisma = global.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});
