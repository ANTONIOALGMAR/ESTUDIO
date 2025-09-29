const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Rota de Registro
router.post('/register', async (req, res) => {
  try {
    // Verifica se o email já existe
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Cria um novo usuário
    const newUser = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
    });

    // Salva o usuário no banco
    const savedUser = await newUser.save();
    res.status(201).json({ user: { id: savedUser._id } });

  } catch (error) {
    console.error('ERRO NO REGISTRO:', error); // Adiciona log detalhado do erro
    res.status(500).json({ message: 'Erro ao registrar usuário.', error });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    // Verifica se o usuário existe
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    // Verifica se a senha está correta
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    // Cria e assina o token
    const token = jwt.sign({ id: user._id }, require('../config/jwt'), { expiresIn: '1h' });

    res.header('auth-token', token).json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error });
  }
});

module.exports = router;
