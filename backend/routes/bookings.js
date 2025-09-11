const router = require('express').Router();
const Booking = require('../models/Booking.model');
const Customer = require('../models/Customer.model'); // Importa o modelo Customer
const verifyToken = require('../middleware/verifyToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Importa o bcrypt

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Chave secreta para JWT, com um fallback de segurança

/**
 * Encontra um cliente existente pelo e-mail ou cria um novo.
 * @param {string} email - E-mail do cliente.
 * @param {string} password - Senha do cliente.
 * @param {string} fullName - Nome completo do cliente.
 * @returns {Promise<{customer: object, isNew: boolean}>}
 */
async function findOrCreateCustomer(email, password, fullName) {
  let customer = await Customer.findOne({ email });
  let isNew = false;

  if (customer) {
    // Cliente existe, valida a senha
    const validPass = await bcrypt.compare(password, customer.password);
    if (!validPass) {
      // Lança um erro se a senha estiver incorreta
      const error = new Error('Email já cadastrado com outra senha. Por favor, faça login ou use outro email.');
      error.status = 400;
      throw error;
    }
  } else {
    // Cliente não existe, cria um novo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCustomer = new Customer({
      fullName,
      email,
      password: hashedPassword,
    });
    customer = await newCustomer.save();
    isNew = true;
  }

  return { customer, isNew };
}

function generateCustomerToken(customerId) {
  return jwt.sign({ id: customerId, isCustomer: true }, JWT_SECRET, { expiresIn: '1h' });
}

// Rota para criar um novo agendamento (Pública)
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      car,
      licensePlate,
      service,
      date,
      address,
      needsPickup,
      password // Recebe a senha, se for fornecida durante o agendamento
    } = req.body;

    let customerId = null;
    let customerToken = null;

    // Se uma senha for fornecida, o usuário está tentando se registrar ou fazer login.
    if (password) {
      const { customer } = await findOrCreateCustomer(email, password, fullName);
      customerId = customer._id;
      customerToken = generateCustomerToken(customerId);
    } else {
      // Se não houver senha, verifica se há um token de cliente logado
    }

    // Se o customerId ainda for nulo, tenta obtê-lo do token (caso o usuário já esteja logado)
    if (!customerId) {
      const token = req.header('auth-token') || req.header('customer-auth-token');
      if (token) {
        try {
          const verified = jwt.verify(token, JWT_SECRET);
          if (verified.isCustomer) customerId = verified.id;
        } catch (err) {
          // Token inválido ou expirado. Ignora e continua sem associar o cliente.
          console.warn('Token inválido ou expirado fornecido ao criar agendamento.');
        }
      }
    }

    const newBooking = new Booking({
      fullName,
      email,
      phone,
      car,
      licensePlate,
      service,
      date,
      address,
      needsPickup,
      customerId, // Associa o agendamento ao cliente, se houver
      status: 'aguardando', // Define o status inicial do agendamento
    });

    const savedBooking = await newBooking.save();

    // Retorna o agendamento salvo e o token do cliente, se um foi gerado
    res.status(201).json({ booking: savedBooking, customerToken });

  } catch (error) {
    console.error('ERRO AO CRIAR AGENDAMENTO:', error);
    res.status(error.status || 500).json({ message: error.message || 'Erro ao criar agendamento.' });
  }
});

// Rota para buscar todos os agendamentos (Protegida)
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }); // Ordena do mais recente para o mais antigo
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos.' });
  }
});

// Rota para buscar agendamentos de um cliente específico (Protegida)
router.get('/customer', verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.isCustomer !== true) { // Verificação mais estrita
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes podem acessar esta rota.' });
    }
    const customerBookings = await Booking.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    res.json(customerBookings);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos do cliente.' });
  }
});

// Rota para deletar um agendamento (Protegida)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem deletar agendamentos.' });
    }
    const removedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!removedBooking) return res.status(404).json({ message: "Agendamento não encontrado." });
    res.json({ message: 'Agendamento deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar agendamento.' });
  }
});

// Rota para atualizar um agendamento (Protegida)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.isAdmin !== true) {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem atualizar agendamentos.' });
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body, // Remove o operador $set para permitir a conversão de tipo do Mongoose
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ message: "Agendamento não encontrado." });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento.' });
  }
});

// Rota para associar agendamentos existentes a um cliente (Protegida)
router.post('/associate-customer', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.isCustomer) {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes podem associar agendamentos.' });
    }

    const customerId = req.user.id;

    // Busca o email do cliente no banco de dados para garantir
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }

    // Atualiza agendamentos sem customerId ou com customerId null que correspondam ao email
    const result = await Booking.updateMany(
      { email: customer.email, customerId: { $in: [null, undefined] } },
      { $set: { customerId: customerId } }
    );

    // Após associar, busca e retorna a lista atualizada de agendamentos do cliente.
    const updatedBookings = await Booking.find({ customerId: customerId }).sort({ createdAt: -1 });

    res.json({ message: `Agendamentos associados: ${result.modifiedCount}`, bookings: updatedBookings });

  } catch (error) {
    console.error('ERRO AO ASSOCIAR AGENDAMENTOS:', error);
    res.status(500).json({ message: 'Erro ao associar agendamentos.' });
  }
});

// Rota para buscar agendamentos filtrados (Protegida)
router.get('/filtered', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};

    if (startDate) {
      query.date = { ...query.date, $gte: new Date(startDate as string) };
    }
    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate as string) };
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const filteredBookings = await Booking.find(query).sort({ date: -1 });
    res.json(filteredBookings);
  } catch (error) {
    console.error('ERRO AO BUSCAR AGENDAMENTOS FILTRADOS:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos filtrados.' });
  }
});

module.exports = router;
