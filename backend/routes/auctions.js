const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Auction = require('../models/Auction');

// @route   GET api/auctions
// @desc    Obtener todas las subastas
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ date: -1 });
    res.json(auctions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/auctions
// @desc    Crear una nueva subasta
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, startingPrice, endDate } = req.body;

    const newAuction = new Auction({
      title,
      description,
      startingPrice,
      currentPrice: startingPrice,
      creator: req.user.id,
      endDate
    });

    const auction = await newAuction.save();
    res.json(auction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/auctions/:id
// @desc    Obtener una subasta por ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ msg: 'Subasta no encontrada' });
    }
    res.json(auction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Subasta no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;
