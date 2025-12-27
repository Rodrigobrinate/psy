"use strict";
/**
 * Prisma Client Singleton
 * Garante apenas uma instância do PrismaClient para evitar esgotamento de conexões
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
// Cria pool de conexões PostgreSQL
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Cria adapter
const adapter = new adapter_pg_1.PrismaPg(pool);
// Cria Prisma Client com adapter
exports.prisma = global.prisma || new prisma_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
// Graceful shutdown
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=prisma.js.map