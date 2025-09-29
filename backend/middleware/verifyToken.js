const jwt = require('jsonwebtoken');

const JWT_SECRET = require('../config/jwt');

module.exports = function (req, res, next) {
  // Tenta obter o token de ambos os cabeçalhos possíveis
  let token = req.header('auth-token') || req.header('customer-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    // Verifica o token e extrai o payload.
    // O payload deve conter { id, isAdmin?, isCustomer? }
    const verified = jwt.verify(token, JWT_SECRET);

    // Anexa o payload decodificado (que contém id, isAdmin, isCustomer) ao objeto req
    req.user = verified;

    next(); // Continua para a próxima etapa
  } catch (err) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};
