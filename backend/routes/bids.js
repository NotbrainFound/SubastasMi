const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// @route   POST api/bids/:auctionId
// @desc    Crear una nueva puja
router.post('/:auctionId', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      return res.status(404).json({ msg: 'Subasta no encontrada' });
    }

    if (new Date(auction.endDate) < new Date()) {
      return res.status(400).json({ msg: 'La subasta ha finalizado' });
    }

    const { amount } = req.body;
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ msg: 'La puja debe ser mayor al precio actual' });
    }

    const newBid = new Bid({
      auction: req.params.auctionId,
      bidder: req.user.id,
      amount
    });

    const bid = await newBid.save();
    auction.currentPrice = amount;
    await auction.save();

    res.json(bid);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/bids/:auctionId
// @desc    Obtener todas las pujas de una subasta
router.get('/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .sort({ createdAt: -1 })
      .populate('bidder', 'name');
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
