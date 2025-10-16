const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const verifyAdmin = require('../middleware/verifyAdmin');
const { checkWeakPassword } = require('../middleware/passwordSecurity');
const { createResourceLimiter } = require('../middleware/rateLimiter');
const { securityLogger } = require('../utils/logger');

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
router.post('/', createResourceLimiter, verifyAdmin, checkWeakPassword, async (req, res) => {
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
    
    // Log da criação de usuário
    securityLogger.adminAction(
      req.user.id, 
      'CREATE_USER', 
      savedUser._id, 
      req.ip, 
      { newUserEmail: email, newUserRole: role }
    );
    
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
    const userId = req.params.id;
    const { fullName, email, password, role } = req.body;

    // Obter o usuário atual do banco de dados
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Inicializa os campos a serem atualizados
    const updateFields = {
      fullName: fullName || currentUser.fullName,
      role: role || currentUser.role,
    };

    // 1. Lógica de atualização de email
    // Verifica se o email foi enviado e se é diferente do email atual
    if (email && email !== currentUser.email) {
      // Verifica se o novo email já está em uso por outro usuário
      const existingUser = await User.findOne({ email: email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado para outro usuário.' });
      }
      updateFields.email = email; // Adiciona o email ao objeto de atualização
    }

    // 2. Lógica de atualização de senha
    // Se uma nova senha for fornecida, faz o hash
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // 3. Executa a atualização no banco de dados
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updatedUser) {
      // Esta verificação pode ser redundante se a de cima já pegou, mas é uma garantia
      return res.status(404).json({ message: 'Falha ao atualizar o usuário.' });
    }

    res.json(updatedUser);

  } catch (err) {
    // Adiciona um log mais detalhado do erro no servidor para depuração
    console.error("Update User Error:", err); 
    if (err.code === 11000) { // Código de erro de duplicidade do MongoDB
      return res.status(400).json({ message: 'O email fornecido já está em uso.' });
    }
    res.status(500).json({ message: 'Erro interno ao atualizar o usuário.', error: err.message });
  }
});

// ROTA DE ADMIN - Deletar um usuário
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const removedUser = await User.findByIdAndDelete(req.params.id);
    if (!removedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    // Log da exclusão de usuário
    securityLogger.adminAction(
      req.user.id,
      'DELETE_USER',
      removedUser._id,
      req.ip,
      { deletedUserEmail: removedUser.email, deletedUserRole: removedUser.role }
    );
    
    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar usuário.', error: err });
  }
});

module.exports = router;
