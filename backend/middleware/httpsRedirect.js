// Middleware para forçar HTTPS em produção
const forceHTTPS = (req, res, next) => {
  // Só aplica em produção
  if (process.env.NODE_ENV === 'production') {
    // Verifica se a conexão não é segura
    if (req.header('x-forwarded-proto') !== 'https') {
      // Redireciona para HTTPS
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
};

// Middleware para adicionar headers de segurança extras
const securityHeaders = (req, res, next) => {
  // Previne que o site seja aberto em frames (clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Impede que o navegador execute scripts inline perigosos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Ativa proteção XSS do navegador
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Controla quais informações de referrer são enviadas
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove informações sobre o servidor
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'EstudioCarvalho');
  
  // Headers para prevenir cache de informações sensíveis
  if (req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

// Middleware para detectar e bloquear bots maliciosos
const blockMaliciousBots = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Lista de user agents suspeitos/maliciosos
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /wget/i,
    /curl.*bot/i,
    /python-requests/i,
    /scanner/i
  ];
  
  // Verifica se o user agent corresponde a algum padrão malicioso
  const isMalicious = maliciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isMalicious) {
    console.warn(`Bot malicioso detectado: ${userAgent} - IP: ${req.ip}`);
    return res.status(403).json({ 
      message: 'Acesso negado.' 
    });
  }
  
  next();
};

module.exports = {
  forceHTTPS,
  securityHeaders,
  blockMaliciousBots
};