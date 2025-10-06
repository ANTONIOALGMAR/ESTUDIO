const mongoose = require('mongoose');

const quoteServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
  },
  services: [quoteServiceSchema],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pendente', 'Aprovado', 'Rejeitado'],
    default: 'Pendente',
  },
}, {
  timestamps: true,
});

// Lógica para gerar um número de orçamento sequencial e único
quoteSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastQuote = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextId = 1;
    if (lastQuote && lastQuote.quoteNumber) {
      const lastId = parseInt(lastQuote.quoteNumber.split('-')[2]);
      if (!isNaN(lastId)) {
        nextId = lastId + 1;
      }
    }
    const year = new Date().getFullYear();
    this.quoteNumber = `ORC-${year}-${String(nextId).padStart(4, '0')}`;
  }
  next();
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
