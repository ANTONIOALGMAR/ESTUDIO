const router = require('express').Router();
const User = require('../models/User.model'); // Admin User
const Customer = require('../models/Customer.model'); // Customer User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Fallback for safety

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tenta autenticar como Admin
    let user = await User.findOne({ email });
    if (user) {
      console.log('Tentando login como Admin para:', email);
      const validPass = await bcrypt.compare(password, user.password);
      console.log('validPass (Admin):', validPass);
      if (validPass) {
        const token = jwt.sign({ id: user._id, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
        return res.header('auth-token', token).json({ token, userType: 'admin' });
      }
    }

    // Se não for Admin ou senha inválida, tenta autenticar como Cliente
    let customer = await Customer.findOne({ email });
    if (customer) {
      console.log('Tentando login como Cliente para:', email);
      const validPass = await bcrypt.compare(password, customer.password);
      console.log('validPass (Cliente):', validPass);
      if (validPass) {
        const token = jwt.sign({ id: customer._id, isCustomer: true }, JWT_SECRET, { expiresIn: '1h' });
        return res.header('customer-auth-token', token).json({ token, userType: 'customer' });
      }
    }

    // Se nenhum dos dois, credenciais inválidas
    res.status(400).json({ message: 'Email ou senha inválidos.' });

  } catch (error) {
    console.error('ERRO NO LOGIN UNIFICADO:', error);
    res.status(500).json({ message: 'Erro no processo de login.' });
  }
});

// Rota de Registro Unificado
router.post('/register', async (req, res) => {
  const { fullName, email, password, userType } = req.body;

  try {
    if (!fullName || !email || !password || !userType) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    let existingUser;
    if (userType === 'admin') {
      existingUser = await User.findOne({ email });
    } else if (userType === 'customer') {
      existingUser = await Customer.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Tipo de usuário inválido.' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (userType === 'admin') {
      newUser = new User({ fullName, email, password: hashedPassword });
    } else {
      newUser = new Customer({ fullName, email, password: hashedPassword });
    }

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: savedUser._id });

  } catch (error) {
    console.error('ERRO NO REGISTRO UNIFICADO:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
});

module.exports = router;
