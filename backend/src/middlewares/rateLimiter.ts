/**
 * Rate Limiting Middleware
 * Proteção contra brute-force e ataques de negação de serviço
 */

import rateLimit from 'express-rate-limit';

// Rate limiter geral para a API
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Muitas requisições deste IP. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter específico para login (mais restritivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});

// Rate limiter para upload de arquivos
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 uploads por hora
  message: {
    error: 'Limite de uploads atingido. Tente novamente em 1 hora.',
  },
});
