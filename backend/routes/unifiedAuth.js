const router = require('express').Router();
const User = require('../models/User.model'); // Admin User
const Customer = require('../models/Customer.model'); // Customer User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const token = jwt.sign({ id: user._id, isAdmin: true }, 'your_jwt_secret_key', { expiresIn: '1h' });
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
        const token = jwt.sign({ id: customer._id, isCustomer: true }, 'your_jwt_secret_key', { expiresIn: '1h' });
        return res.header('customer-auth-token', token).json({ token, userType: 'customer' });
      }
    }

    // Se nenhum dos dois, credenciais inválidas
    res.status(400).json({ message: 'Email ou senha inválidos.' });

  } catch (error) {
    console.error('ERRO NO LOGIN UNIFICADO:', error);
    res.status(500).json({ message: 'Erro no processo de login.', error });
  }
});

module.exports = router;
