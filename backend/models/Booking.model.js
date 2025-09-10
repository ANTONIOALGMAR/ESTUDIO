const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  car: String,
  licensePlate: String,
  service: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  address: String,
  needsPickup: Boolean,
  status: {
    type: String,
    default: 'aguardando' // ex: aguardando, confirmado, concluído, cancelado
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }
}, { timestamps: true });

// Adiciona um índice composto para otimizar buscas por email e customerId.
// Isso acelera muito a rota /associate-customer.
bookingSchema.index({ email: 1, customerId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;