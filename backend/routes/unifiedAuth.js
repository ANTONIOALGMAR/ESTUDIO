const router = require('express').Router();
const User = require('../models/User.model'); // Admin User
const Customer = require('../models/Customer.model'); // Customer User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = require('../config/jwt');

// Middleware para extrair e verificar o token
const extractUserFromToken = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return next(); // Continua sem usuário se não houver token

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    let user;
    if (verified.isAdmin) {
      user = await User.findById(verified.id).select('-password');
    } else if (verified.isCustomer) {
      user = await Customer.findById(verified.id).select('-password');
    }
    req.user = user; // Anexa o usuário à requisição
  } catch (err) {
    // Token inválido ou expirado, simplesmente ignora
  }
  next();
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  try {
    // Verifica se o usuário é um Admin
    const adminUser = await User.findOne({ email });
    if (adminUser) {
      const validPass = await bcrypt.compare(password, adminUser.password);
      if (!validPass) {
        return res.status(400).json({ message: 'Email ou senha inválidos.' });
      }
      const token = jwt.sign({ id: adminUser._id, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { id: adminUser._id, fullName: adminUser.fullName, email: adminUser.email, userType: 'admin' } });
    }

    // Se não for Admin, verifica se é um Cliente
    const customerUser = await Customer.findOne({ email });
    if (customerUser) {
      const validPass = await bcrypt.compare(password, customerUser.password);
      if (!validPass) {
        return res.status(400).json({ message: 'Email ou senha inválidos.' });
      }
      const token = jwt.sign({ id: customerUser._id, isCustomer: true }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { id: customerUser._id, fullName: customerUser.fullName, email: customerUser.email, userType: 'customer' } });
    }

    // Se o email não for encontrado em nenhuma coleção
    res.status(400).json({ message: 'Email ou senha inválidos.' });

  } catch (error) {
    console.error('ERRO NO LOGIN UNIFICADO:', error);
    res.status(500).json({ message: 'Erro no processo de login.' });
  }
});

// Nova rota para verificar um token e retornar os dados do usuário
router.get('/verify-token', extractUserFromToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token inválido ou sessão expirada.' });
  }
  // Adiciona o userType com base na estrutura do usuário
  const userType = req.user.constructor.modelName.toLowerCase(); // 'user' se torna 'admin', 'customer' fica 'customer'
  const finalUserType = userType === 'user' ? 'admin' : userType;
  res.json({ user: { ...req.user.toObject(), userType: finalUserType } });
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
