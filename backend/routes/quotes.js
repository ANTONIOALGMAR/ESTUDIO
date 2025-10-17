const router = require('express').Router();
const Quote = require('../models/Quote.model');
const Service = require('../models/Service.model');
const verifyAdmin = require('../middleware/verifyAdmin');
const mongoose = require('mongoose'); // Importa o mongoose

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
  console.log("--- [DEBUG v3] INICIANDO CRIAÇÃO DE ORÇAMENTO ---");
  console.log("Request Body Recebido:", JSON.stringify(req.body, null, 2));

  const { customer, serviceIds } = req.body;

  if (!customer || !customer.name || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    console.log("--- [DEBUG v3] VALIDAÇÃO FALHOU (dados básicos) ---");
    console.log("Customer:", customer);
    console.log("Service IDs:", serviceIds);
    return res.status(400).json({ message: 'Dados do cliente e ao menos um serviço são obrigatórios.' });
  }

  // Validação de IDs de serviço
  const invalidIds = serviceIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    console.log("--- [DEBUG v3] VALIDAÇÃO FALHOU (IDs inválidos) ---");
    console.log("IDs inválidos detectados:", invalidIds);
    return res.status(400).json({ message: 'Um ou mais IDs de serviço são inválidos.', invalidIds });
  }

  try {
    // Converte explicitamente as strings de ID para ObjectIds do MongoDB
    const objectIdServiceIds = serviceIds.map(id => new mongoose.Types.ObjectId(id));

    if (services.length !== serviceIds.length) {
      return res.status(404).json({ message: 'Um ou mais serviços não foram encontrados.' });
    }

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
    console.error("--- [DEBUG v3] ERRO NO CATCH ---", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: `ID de serviço inválido fornecido: ${err.value}` });
    }
    res.status(500).json({ message: 'Erro interno ao criar orçamento.', error: err });
  }
});

module.exports = router;
