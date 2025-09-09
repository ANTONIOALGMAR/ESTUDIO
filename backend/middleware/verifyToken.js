const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ message: 'Acesso negado.' });

  try {
    const verified = jwt.verify(token, 'your_jwt_secret_key');
    req.user = { id: verified.id, isCustomer: verified.isCustomer || false };
    next(); // Continua para a próxima etapa
  } catch (err) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};
