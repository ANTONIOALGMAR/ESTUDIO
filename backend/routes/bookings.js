const router = require('express').Router();
const Booking = require('../models/Booking.model');
const Customer = require('../models/Customer.model'); // Importa o modelo Customer
const verifyToken = require('../middleware/verifyToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Importa o bcrypt

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
      password // Recebe a senha, se fornecida
    } = req.body;

    let customerId = null;
    let customerToken = null;

    // Lógica para associar ou criar cliente se a senha for fornecida
    if (password) {
      let customer = await Customer.findOne({ email });

      if (customer) {
        // Cliente existe, tenta fazer login
        const validPass = await bcrypt.compare(password, customer.password);
        if (!validPass) {
          return res.status(400).json({ message: 'Email já cadastrado com outra senha. Por favor, faça login ou use outro email.' });
        }
        customerId = customer._id;
      } else {
        // Cliente não existe, cria um novo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newCustomer = new Customer({
          fullName, // Assume que o fullName do agendamento é o do cliente
          email,
          password: hashedPassword,
        });
        customer = await newCustomer.save();
        customerId = customer._id;
      }
      // Gera token para o cliente
      customerToken = jwt.sign({ id: customer._id, isCustomer: true }, 'your_jwt_secret_key', { expiresIn: '1h' });
    } else {
      // Se a senha não for fornecida, verifica se já existe um token de cliente logado
      const token = req.header('auth-token');
      if (token) {
        try {
          const verified = jwt.verify(token, 'your_jwt_secret_key');
          if (verified.isCustomer) {
            customerId = verified.id;
          }
        } catch (err) {
          console.warn('Token inválido ou expirado ao criar agendamento, continuando sem customerId.');
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
      customerId, // Adiciona o customerId
      status: 'aguardando', // Status inicial
    });

    const savedBooking = await newBooking.save();

    // Retorna o agendamento e o token do cliente, se houver
    res.status(201).json({ booking: savedBooking, customerToken });

  } catch (error) {
    console.error('ERRO AO CRIAR AGENDAMENTO:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento.', error });
  }
});

// Rota para buscar todos os agendamentos (Protegida)
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }); // Ordena pelos mais recentes
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos.', error });
  }
});

// Rota para buscar agendamentos de um cliente específico (Protegida)
router.get('/customer', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.isCustomer) {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes podem acessar esta rota.' });
    }
    const customerBookings = await Booking.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    res.json(customerBookings);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos do cliente.', error });
  }
});

// Rota para deletar um agendamento (Protegida)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const removedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!removedBooking) return res.status(404).json({ message: "Agendamento não encontrado." });
    res.json({ message: 'Agendamento deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar agendamento.', error });
  }
});

// Rota para atualizar um agendamento (Protegida)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ message: "Agendamento não encontrado." });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento.', error });
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

    res.json({ message: `Agendamentos associados: ${result.modifiedCount}` });

  } catch (error) {
    console.error('ERRO AO ASSOCIAR AGENDAMENTOS:', error);
    res.status(500).json({ message: 'Erro ao associar agendamentos.', error });
  }
});

module.exports = router;
