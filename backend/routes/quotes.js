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
  console.log("--- INICIANDO CRIAÇÃO DE ORÇAMENTO (v2) ---"); // Log de versão
  const { customerData: customer, selectedServices: serviceIds } = req.body;

  console.log("Request Body Recebido:", JSON.stringify(req.body, null, 2));

  if (!customer || !customer.name || !customer.email || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    console.log("Validação falhou: Dados do cliente ou serviceIds ausentes/inválidos.");
    return res.status(400).json({ message: 'Dados do cliente e ao menos um serviço são obrigatórios.' });
  }

  console.log("Service IDs Recebidos:", serviceIds);

  try {
    // Converte explicitamente as strings de ID para ObjectIds do MongoDB
    const objectIdServiceIds = serviceIds.map(id => new mongoose.Types.ObjectId(id));
    console.log("ObjectIDs Convertidos:", objectIdServiceIds);

    // Busca os serviços no banco de dados para garantir a integridade dos preços
    console.log("Executando Service.find com os ObjectIDs...");
    const services = await Service.find({ _id: { $in: objectIdServiceIds } });
    console.log("Serviços encontrados:", services.length);

    if (services.length !== serviceIds.length) {
      console.log("Erro: Nem todos os serviços foram encontrados.");
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

    console.log("Salvando novo orçamento...");
    const savedQuote = await newQuote.save();
    console.log("Orçamento salvo com sucesso!");
    res.status(201).json(savedQuote);

  } catch (err) {
    console.error("--- ERRO DETALHADO AO CRIAR ORÇAMENTO ---", err);
    // Verifica se o erro é um CastError e fornece uma mensagem mais clara
    if (err.name === 'CastError') {
      return res.status(400).json({ message: `ID de serviço inválido fornecido: ${err.value}` });
    }
    res.status(500).json({ message: 'Erro interno ao criar orçamento.', error: err });
  }
});

module.exports = router;
