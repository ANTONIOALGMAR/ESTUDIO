const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  car: { type: String },
  licensePlate: { type: String },
  service: { type: [String], required: true },
  date: { type: Date, required: true },
  address: {
    cep: String,
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
  },
  needsPickup: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['aguardando', 'em andamento', 'pronto', 'entregue'],
    default: 'aguardando',
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', BookingSchema);
