const router = require('express').Router();
const Customer = require('../models/Customer.model');
const Booking = require('../models/Booking.model'); // Precisamos dos agendamentos
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

// ROTA DE ADMIN - Obter detalhes de um cliente específico e seus agendamentos
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const customerId = req.params.id;

    // Busca o cliente pelo ID
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }

    // Busca todos os agendamentos associados a esse cliente
    const bookings = await Booking.find({ customerId: customerId }).sort({ date: -1 });

    // Retorna os dados do cliente e seus agendamentos
    res.json({ customer, bookings });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar detalhes do cliente.', error: err });
  }
});

module.exports = router;
