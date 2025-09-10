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
    type: [String], // Alterado para aceitar um array de strings
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  address: { // Alterado para aceitar um objeto de endereço
    type: {
      cep: String,
      street: String,
      number: String,
      complement: String,
      neighborhood: String,
      city: String,
    },
    required: false // O endereço só é necessário se needsPickup for true
  },
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