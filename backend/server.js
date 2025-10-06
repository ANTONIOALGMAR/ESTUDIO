require('dotenv').config();

const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet'); // Importa o Helmet

// Initialize Express app
const app = express();
app.use(helmet()); // Usa o Helmet para segurança dos headers
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
  allowedHeaders: ["Content-Type", "auth-token", "customer-auth-token"] // Garanta que os headers de token sejam permitidos
}));
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri);

const connection = mongoose.connection;
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
