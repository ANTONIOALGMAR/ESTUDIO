const express = require('express');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite acesso de qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, auth-token');
  next();
});
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
