/**
 * Psy-Manager AI - Backend Server
 * Sistema de gestão para psicólogos com IA integrada
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Middlewares
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';

// Routes
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import testRoutes from './routes/test.routes';
import appointmentRoutes from './routes/appointment.routes';
import financialRoutes from './routes/financial.routes';
import documentRoutes from './routes/document.routes';
import serviceRoutes from './routes/service.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// ====================================
// MIDDLEWARES GLOBAIS
// ====================================

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/services', serviceRoutes);

// ====================================
// ERROR HANDLER (deve ser o último middleware)
// ====================================

app.use(errorHandler);

// ====================================
// SERVER START
// ====================================

import { prisma } from './lib/prisma';

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed from: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  
  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});


  