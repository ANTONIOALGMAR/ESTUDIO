require('dotenv').config();

const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet'); // Importa o Helmet
const { globalLimiter } = require('./middleware/rateLimiter'); // Importa rate limiting
const { mongoSanitizer, sanitizeInput } = require('./middleware/sanitization'); // Importa sanitização
const { forceHTTPS, securityHeaders, blockMaliciousBots } = require('./middleware/httpsRedirect'); // Importa segurança HTTPS
const { requestLogger, logger } = require('./utils/logger'); // Importa sistema de logging

// Initialize Express app
const app = express();
app.set('trust proxy', 1); // Confia no primeiro proxy (necessário para o Render)

// Aplicar middlewares de segurança primeiro
app.use(forceHTTPS); // Força HTTPS em produção
app.use(securityHeaders); // Headers de segurança extras
app.use(blockMaliciousBots); // Bloqueia bots maliciosos

// Configuração avançada do Helmet para segurança
app.use(helmet({
  // Força HTTPS em produção
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  // Controla como o conteúdo pode ser incorporado
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.render.com"] // Permitir conexões necessárias
    },
  },
  // Impede que o site seja incorporado em iframes
  frameguard: { action: 'deny' },
  // Remove header X-Powered-By
  hidePoweredBy: true,
  // Previne MIME type sniffing
  noSniff: true,
  // Força download de arquivos potencialmente perigosos
  xssFilter: true,
  // Controla informações de referrer
  referrerPolicy: { policy: "same-origin" }
}));

app.use(globalLimiter); // Aplica rate limiting global
app.use(requestLogger); // Adiciona logging de requests
const port = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'https://estudio-frontend-v1zk.onrender.com',
  'http://localhost:3000' // Adicione para desenvolvimento local, se necessário
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "auth-token", "customer-auth-token"] // Garanta que os headers de token sejam permitidos
}));
app.use(express.json());
app.use(mongoSanitizer); // Previne NoSQL injection
// app.use(sanitizeInput); // Desabilitado para teste de bug
app.use(require('cookie-parser')());

// MongoDB Connection
const uri = process.env.MONGO_URI;
console.log('Attempting to connect to MongoDB...');
mongoose.connect(uri);

const connection = mongoose.connection;
connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Import Routes
const unifiedAuthRoutes = require('./routes/unifiedAuth');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services'); // Importa as rotas de serviço
const customerRoutes = require('./routes/customers'); // Importa as rotas de cliente
const analyticsRoutes = require('./routes/analytics'); // Importa as rotas de analytics
const userRoutes = require('./routes/users'); // Importa as rotas de usuário
const quoteRoutes = require('./routes/quotes'); // Importa as rotas de orçamento

// Route Middlewares
app.use('/api/unified-auth', unifiedAuthRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quotes', quoteRoutes);


// Simple test route
app.get('/', (req, res) => {
    res.send('Backend do Studio Carvalho está no ar!');
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'A rota solicitada não foi encontrada.'));
});

// Global error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500).json({ message: err.message || 'Ocorreu um erro interno no servidor.' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
