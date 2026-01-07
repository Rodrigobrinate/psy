/**
 * Prisma Client Singleton
 * Garante apenas uma instância do PrismaClient para evitar esgotamento de conexões
 */

import dotenv from 'dotenv';
dotenv.config(); // Carrega .env ANTES de usar process.env

import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Cria pool de conexões PostgreSQL com configurações robustas
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Máximo de conexões
  idleTimeoutMillis: 30000, // Tempo ocioso antes de fechar conexão
  connectionTimeoutMillis: 10000, // Timeout para conectar
  ssl: false, // Banco auto-hospedado sem SSL
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Pool error on idle client:', err);
});

// Testar conexão do pool diretamente
pool.connect()
  .then(client => {
    console.log('✅ Pool pg connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Pool pg connection failed:');
    console.error('  Error code:', err.code);
    console.error('  Error message:', err.message);
    console.error('  Full error:', err);
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
