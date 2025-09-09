const router = require('express').Router();
const Customer = require('../models/Customer.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Rota de Registro de Cliente
router.post('/register', async (req, res) => {
  try {
    // Verifica se o email já existe
    const customerExists = await Customer.findOne({ email: req.body.email });
    if (customerExists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Cria um novo cliente
    const newCustomer = new Customer({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
    });

    // Salva o cliente no banco
    const savedCustomer = await newCustomer.save();
    res.status(201).json({ customer: { id: savedCustomer._id } });

  } catch (error) {
    console.error('ERRO NO REGISTRO DE CLIENTE:', error);
    res.status(500).json({ message: 'Erro ao registrar cliente.', error });
  }
});

// Rota de Login de Cliente
router.post('/login', async (req, res) => {
  try {
    // Verifica se o cliente existe
    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    // Verifica se a senha está correta
    const validPassword = await bcrypt.compare(req.body.password, customer.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    // Cria e assina o token
    const token = jwt.sign({ id: customer._id, isCustomer: true }, 'your_jwt_secret_key', { expiresIn: '1h' });

    res.header('auth-token', token).json({ token });

  } catch (error) {
    console.error('ERRO NO LOGIN DE CLIENTE:', error);
    res.status(500).json({ message: 'Erro ao fazer login de cliente.', error });
  }
});

module.exports = router;
