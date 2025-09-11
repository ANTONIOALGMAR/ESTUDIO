const router = require('express').Router();
const Customer = require('../models/Customer.model');
const verifyAdmin = require('../middleware/verifyAdmin');

// ROTA DE ADMIN - Listar todos os clientes
router.get('/', verifyAdmin, async (req, res) => {
  try {
    // Busca todos os clientes e ordena por data de criação
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar clientes.', error: err });
  }
});

module.exports = router;
