const jwt = require('jsonwebtoken');

const JWT_SECRET = require('../config/jwt');

module.exports = function (req, res, next) {
  // Padrão moderno: obter o token do cabeçalho 'Authorization' (ex: "Bearer eyJhbGci...")
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extrai o token, removendo o prefixo "Bearer "
    token = authHeader.substring(7, authHeader.length);
  }

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    // Verifica o token e extrai o payload. O payload deve conter { id, userType }
    const verified = jwt.verify(token, JWT_SECRET);

    // Anexa o payload decodificado (que contém id, userType) ao objeto req
    req.user = { ...verified, isAdmin: verified.userType === 'admin' };

    next(); // Continua para a próxima etapa
  } catch (err) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};
