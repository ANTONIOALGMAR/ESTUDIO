const verifyToken = require('./verifyToken');

// Este middleware assume que o verifyToken já foi executado
// e que req.user está disponível.
const verifyAdmin = (req, res, next) => {
  // Reutilizamos o verifyToken para garantir que o usuário está logado
  verifyToken(req, res, () => {
    // Após a verificação do token, checamos se o usuário é um admin
    if (req.user && req.user.isAdmin) {
      next(); // O usuário é um admin, pode prosseguir
    } else {
      res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
    }
  });
};

module.exports = verifyAdmin;
