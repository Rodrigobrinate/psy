"use strict";
/**
 * Psy-Manager AI - Backend Server
 * Sistema de gestão para psicólogos com IA integrada
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Middlewares
const errorHandler_1 = require("./middlewares/errorHandler");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const financial_routes_1 = __importDefault(require("./routes/financial.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
// ====================================
// MIDDLEWARES GLOBAIS
// ====================================
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting global
//app.use(apiLimiter);
// ====================================
// ROUTES
// ====================================
app.get('/', (req, res) => {
    res.json({
        message: 'Psy-Manager AI - API Running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            patients: '/api/patients',
            tests: '/api/tests',
            appointments: '/api/appointments',
            financial: '/api/financial',
            documents: '/api/documents',
            services: '/api/services',
        },
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/patients', patient_routes_1.default);
app.use('/api/tests', test_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/financial', financial_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/services', service_routes_1.default);
// ====================================
// ERROR HANDLER (deve ser o último middleware)
// ====================================
app.use(errorHandler_1.errorHandler);
// ====================================
// SERVER START
// ====================================
const prisma_1 = require("./lib/prisma");
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS allowed from: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    // Test database connection
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        console.log('✅ Database connection successful');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
    }
});
//# sourceMappingURL=index.js.map