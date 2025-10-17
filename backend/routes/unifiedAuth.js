const router = require('express').Router();
const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { authLimiter, createResourceLimiter } = require('../middleware/rateLimiter');
const { checkWeakPassword } = require('../middleware/passwordSecurity');
const { securityLogger } = require('../utils/logger');

require('dotenv').config(); // Garante que as variáveis de ambiente sejam carregadas

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}
// É uma boa prática usar um segredo diferente para o refresh token.
// Adicione REFRESH_TOKEN_SECRET ao seu arquivo .env
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'some-super-strong-secret-for-refresh-token';

router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }) || await Customer.findOne({ email });

    if (!user) {
      // Log tentativa de login com email inválido
      securityLogger.loginAttempt(email, false, req.ip, req.get('User-Agent'), { reason: 'user_not_found' });
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      // Log tentativa de login com senha inválida
      securityLogger.loginAttempt(email, false, req.ip, req.get('User-Agent'), { reason: 'invalid_password', userId: user._id });
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const userType = user.constructor.modelName === 'Customer' ? 'customer' : 'admin';

    const accessToken = jwt.sign(
      { id: user._id, userType: userType },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, userType: userType },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    // Log login bem-sucedido
    securityLogger.loginAttempt(email, true, req.ip, req.get('User-Agent'), { 
      userId: user._id, 
      userType: userType 
    });

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.json({
      accessToken,
      user: { id: user._id, fullName: user.fullName, email: user.email, userType: userType }
    });

  } catch (error) {
    console.error('ERRO NO LOGIN UNIFICADO:', error);
    res.status(500).json({ message: 'Erro no processo de login.' });
  }
});

router.get('/refresh', async (req, res) => {
  console.log("--- [DEBUG] Rota /refresh alcançada ---"); // Log de entrada
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: 'Refresh token não encontrado no cookie.' });
  }

  const refreshToken = cookies.jwt;

  try {
    // Tenta encontrar o usuário com base no refresh token
    const user = await User.findOne({ refreshToken }).exec() || await Customer.findOne({ refreshToken }).exec();
    if (!user) {
      // Se o token existe mas não corresponde a nenhum usuário, é uma falha de segurança.
      // Limpa o cookie malicioso e retorna erro.
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      return res.status(403).json({ message: 'Falha na autenticação do refresh token.' });
    }

    // Verifica o refresh token de forma síncrona dentro do try/catch
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Validação extra para garantir que o token pertence ao usuário encontrado
    if (user.id !== decoded.id) {
      return res.status(403).json({ message: 'Inconsistência no token.' });
    }

    // Se tudo estiver correto, gera um novo access token
    const userType = user.constructor.modelName === 'Customer' ? 'customer' : 'admin';
    const accessToken = jwt.sign(
      { id: decoded.id, userType: userType },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Retorna o novo token e os dados do usuário
    res.json({
      accessToken,
      user: { id: user._id, fullName: user.fullName, email: user.email, userType: userType }
    });

  } catch (err) {
    // Se jwt.verify falhar (token inválido, expirado, etc.), um erro será lançado
    return res.status(403).json({ message: 'Refresh token inválido ou expirado.' });
  }
});

router.post('/logout', async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken }).exec() || await Customer.findOne({ refreshToken }).exec();

  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.sendStatus(204);
});

// Rota para verificar um token e retornar os dados do usuário (pode ser útil para o frontend)
router.get('/verify-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        try {
            const user = await User.findById(decoded.id).select('-password -refreshToken') || await Customer.findById(decoded.id).select('-password -refreshToken');
            if (!user) {
                return res.status(404).json({ message: 'Usuário do token não encontrado.' });
            }
            const userType = user.constructor.modelName === 'Customer' ? 'customer' : 'admin';
            res.json({ user: { ...user.toObject(), userType } });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar usuário do token.' });
        }
    });
});


router.post('/register', createResourceLimiter, validate(registerSchema), checkWeakPassword, async (req, res) => {
  const { fullName, email, password, userType } = req.body;

  try {
    let existingUser;
    if (userType === 'admin') {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = await Customer.findOne({ email });
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