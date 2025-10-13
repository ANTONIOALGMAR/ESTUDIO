const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

// Configuração personalizada do XSS para permitir alguns elementos seguros
const xssOptions = {
  whiteList: {
    // Permite apenas tags HTML básicas e seguras se necessário
    // Para este caso, vamos ser restritivos e não permitir HTML
  },
  stripIgnoreTag: true, // Remove tags não permitidas
  stripIgnoreTagBody: ['script'], // Remove completamente tags script
};

// Middleware para sanitizar dados de entrada
const sanitizeInput = (req, res, next) => {
  // Sanitiza recursivamente todos os dados do body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        req.body[key] = sanitizeValue(req.body[key]);
      }
    }
  }
  
  // Sanitiza query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (Object.hasOwnProperty.call(req.query, key)) {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    }
  }
  
  // Sanitiza params
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (Object.hasOwnProperty.call(req.params, key)) {
        req.params[key] = sanitizeValue(req.params[key]);
      }
    }
  }
  
  next();
};

// Função para sanitizar objetos recursivamente
const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeValue(value);
      }
      return sanitized;
    }
  }
  return sanitizeValue(obj);
};

// Função para sanitizar valores individuais
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  } else if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

// Função para sanitizar strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove scripts maliciosos e XSS
  let sanitized = xss(str, xssOptions);
  
  // Remove caracteres de controle perigosos
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Remove tentativas de SQL injection (para precaução extra)
  sanitized = sanitized.replace(/(<script.*?>.*?<\/script>)/gim, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
};

// Middleware específico para MongoDB - previne NoSQL injection
const mongoSanitizer = mongoSanitize({
  replaceWith: '_', // Substitui caracteres perigosos por _
});

// Middleware para validar tipos de dados esperados
const validateDataTypes = (req, res, next) => {
  // Verifica se campos que devem ser ObjectId são válidos
  const objectIdFields = ['id', '_id', 'userId', 'customerId', 'serviceId', 'bookingId'];
  
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  // Verifica params
  if (req.params) {
    for (const [key, value] of Object.entries(req.params)) {
      if (objectIdFields.includes(key) && value && !isValidObjectId(value)) {
        return res.status(400).json({ 
          message: `Formato inválido para o campo ${key}` 
        });
      }
    }
  }
  
  // Verifica body para campos específicos
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (objectIdFields.includes(key) && value && !isValidObjectId(value)) {
        return res.status(400).json({ 
          message: `Formato inválido para o campo ${key}` 
        });
      }
    }
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  mongoSanitizer,
  validateDataTypes,
  sanitizeString,
  sanitizeObject
};