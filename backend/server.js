require('dotenv').config();

const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Determine allowed origins based on environment
const allowedOrigins = [
  'http://localhost:3000', // Desenvolvimento local
];
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL_PROD) {
  allowedOrigins.push(process.env.FRONTEND_URL_PROD); // URL de produção principal
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem 'origin' (como apps mobile ou curl) ou se a origem estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: A origem '${origin}' foi bloqueada.`);
      callback(new Error('Não permitido por CORS'));
    }
  }
};
// Middleware
app.use(cors(corsOptions));
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

// Route Middlewares
app.use('/api/unified-auth', unifiedAuthRoutes);
app.use('/api/bookings', bookingRoutes);


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
