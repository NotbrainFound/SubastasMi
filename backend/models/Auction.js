// models/Auction.js
const mongoose = require('mongoose');

const auctionSchema = mongoose.Schema({
  seller: {
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
  endDate: {
    type: Date,
    required: true
  },
  bids: [{
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    time: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Auction', auctionSchema);
