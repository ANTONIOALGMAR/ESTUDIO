const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const verifyAdmin = require('../middleware/verifyAdmin');

// ROTA DE ADMIN - Listar todos os usuários (admins e funcionários)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }); // Não retorna a senha
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuários.', error: err });
  }
});

// ROTA DE ADMIN - Criar um novo usuário (admin ou funcionário)
router.post('/', verifyAdmin, async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    // Verifica se o email já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o novo usuário
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'funcionario', // Garante que o role seja definido, padrão 'funcionario'
    });

    const savedUser = await newUser.save();
    // Retorna o usuário sem a senha
    const { password: userPassword, ...rest } = savedUser._doc;
    res.status(201).json(rest);

  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar usuário.', error: err });
  }
});

// ROTA DE ADMIN - Atualizar um usuário
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const updateFields = { fullName, email, role };

    // Se a senha for fornecida, faz o hash
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true } // Retorna o documento atualizado e roda validadores
    ).select('-password'); // Não retorna a senha

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.', error: err });
  }
});

// ROTA DE ADMIN - Deletar um usuário
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const removedUser = await User.findByIdAndDelete(req.params.id);
    if (!removedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar usuário.', error: err });
  }
});

module.exports = router;
