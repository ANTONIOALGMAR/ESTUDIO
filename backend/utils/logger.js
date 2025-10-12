const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  defaultMeta: { service: 'estudio-carvalho-backend' },
  transports: [
    // Log de erros em arquivo separado
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Log geral
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),

    // Log de segurança em arquivo separado
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

// Em desenvolvimento, também log no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Criar diretório de logs se não existir
const fs = require('fs');
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Função para gerar ID único de request
const generateRequestId = () => uuidv4();

// Middleware para adicionar ID único a cada request
const requestLogger = (req, res, next) => {
  req.requestId = generateRequestId();
  
  // Log básico da requisição
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  next();
};

// Funções especializadas de logging de segurança
const securityLogger = {
  // Log de tentativas de login
  loginAttempt: (email, success, ip, userAgent, details = {}) => {
    const logData = {
      type: 'LOGIN_ATTEMPT',
      email: email,
      success: success,
      ip: ip,
      userAgent: userAgent,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    if (success) {
      logger.info('Login successful', logData);
    } else {
      logger.warn('Login failed', logData);
    }
  },

  // Log de operações administrativas
  adminAction: (userId, action, target, ip, details = {}) => {
    logger.warn('Admin action performed', {
      type: 'ADMIN_ACTION',
      userId: userId,
      action: action,
      target: target,
      ip: ip,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  // Log de tentativas de acesso não autorizado
  unauthorizedAccess: (ip, endpoint, method, userAgent, details = {}) => {
    logger.error('Unauthorized access attempt', {
      type: 'UNAUTHORIZED_ACCESS',
      ip: ip,
      endpoint: endpoint,
      method: method,
      userAgent: userAgent,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  // Log de tentativas de rate limiting
  rateLimitHit: (ip, endpoint, limit, windowMs, userAgent) => {
    logger.warn('Rate limit exceeded', {
      type: 'RATE_LIMIT_EXCEEDED',
      ip: ip,
      endpoint: endpoint,
      limit: limit,
      windowMs: windowMs,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    });
  },

  // Log de tentativas de injection
  injectionAttempt: (ip, type, payload, endpoint, userAgent) => {
    logger.error('Injection attempt detected', {
      type: 'INJECTION_ATTEMPT',
      injectionType: type,
      ip: ip,
      payload: payload.substring(0, 500), // Limita tamanho do payload
      endpoint: endpoint,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    });
  },

  // Log de alterações em dados sensíveis
  sensitiveDataChange: (userId, dataType, recordId, changes, ip) => {
    logger.warn('Sensitive data changed', {
      type: 'SENSITIVE_DATA_CHANGE',
      userId: userId,
      dataType: dataType,
      recordId: recordId,
      changes: changes,
      ip: ip,
      timestamp: new Date().toISOString()
    });
  },

  // Log de exportação de dados
  dataExport: (userId, dataType, recordCount, ip) => {
    logger.warn('Data export performed', {
      type: 'DATA_EXPORT',
      userId: userId,
      dataType: dataType,
      recordCount: recordCount,
      ip: ip,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  securityLogger,
  requestLogger,
  generateRequestId
};