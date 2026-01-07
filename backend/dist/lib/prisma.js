"use strict";
/**
 * Prisma Client Singleton
 * Garante apenas uma instância do PrismaClient para evitar esgotamento de conexões
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Carrega .env ANTES de usar process.env
const prisma_1 = require("../generated/prisma");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
// Cria pool de conexões PostgreSQL com configurações robustas
const pool = new pg_1.Pool({
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