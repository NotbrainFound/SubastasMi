// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Arte', 'Tecnología', 'Casa', 'Otros'],
    required: true
  },
  images: [String],
  initialPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number
  },
  status: {
    type: String,
    enum: ['activo', 'vendido', 'cancelado'],
    default: 'activo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
