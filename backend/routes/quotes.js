const router = require('express').Router();
const Quote = require('../models/Quote.model');
const Service = require('../models/Service.model');
const verifyAdmin = require('../middleware/verifyAdmin');

// ROTA DE ADMIN - Listar todos os orçamentos
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar orçamentos.', error: err });
  }
});

// ROTA DE ADMIN - Criar um novo orçamento
router.post('/', verifyAdmin, async (req, res) => {
  const { customer, serviceIds } = req.body;

  if (!customer || !serviceIds || serviceIds.length === 0) {
    return res.status(400).json({ message: 'Dados do cliente e ao menos um serviço são obrigatórios.' });
  }

  try {
    // Busca os serviços no banco de dados para garantir a integridade dos preços
    const services = await Service.find({ '_id': { $in: serviceIds } });
    if (services.length !== serviceIds.length) {
      return res.status(404).json({ message: 'Um ou mais serviços não foram encontrados.' });
    }

    // Calcula o preço total no backend
    const totalPrice = services.reduce((total, service) => total + service.price, 0);

    const servicesForQuote = services.map(s => ({ name: s.name, price: s.price }));

    const newQuote = new Quote({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      services: servicesForQuote,
      totalPrice,
    });

    const savedQuote = await newQuote.save();
    res.status(201).json(savedQuote);

  } catch (err) {
    console.error("ERRO AO CRIAR ORÇAMENTO:", err);
    res.status(400).json({ message: 'Erro ao criar orçamento.', error: err });
  }
});

module.exports = router;
