const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = "mongodb://localhost:27017/studioo__carvalhoo";
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
