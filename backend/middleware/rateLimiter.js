const rateLimit = require('express-rate-limit');
const { securityLogger } = require('../utils/logger');

// Rate limiting global para todas as rotas
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP por janela de tempo
  message: {
    error: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Inclui headers de rate limit nas respostas
  legacyHeaders: false,
  // Skip algumas rotas se necessário
  skip: (req, res) => {
    // Exemplo: pular rate limiting para health checks
    return req.path === '/' || req.path === '/health';
  }
});

// Rate limiting específico para operações sensíveis (login, registro, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos  
  max: 5, // Máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Aplicar delay progressivo
  delayMs: (hits) => hits * 1000, // 1s, 2s, 3s, etc.
  delayAfter: 2 // Aplicar delay após 2 tentativas
});

// Rate limiting para operações administrativas
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Máximo 50 requests por IP para operações admin
  message: {
    error: 'Limite de operações administrativas excedido. Tente novamente em 15 minutos.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para criação de recursos (criar usuários, serviços, etc.)
const createResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 10 criações por hora
  message: {
    error: 'Limite de criação de recursos excedido. Tente novamente em 1 hora.',
    retryAfter: Math.ceil((60 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  globalLimiter,
  authLimiter,
  adminLimiter,
  createResourceLimiter
};