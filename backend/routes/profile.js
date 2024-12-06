// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

// @route   GET api/profile/me
// @desc    Obtener el perfil del usuario actual
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('auctions')
      .populate('bids');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// @route   PUT api/profile/update
// @desc    Actualizar el perfil con imagen
router.put('/update', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, bio, location, website } = req.body;
    
    // Construir objeto de actualización
    const updateData = {
      name,
      email,
      profileInfo: {
        bio,
        location,
        website
      }
    };

    if (req.file) {
      // Agregar la ruta del archivo a los datos de actualización
      updateData.profileInfo.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE api/profile/avatar
// @desc    Eliminar avatar del perfil
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Eliminar avatar
    user.profileInfo.avatar = null;
    await user.save();

    res.json({ msg: 'Avatar eliminado exitosamente' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// @route   GET api/profile/stats
// @desc    Obtener estadísticas del usuario
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Aquí puedes agregar lógica para obtener estadísticas
    // como número de subastas ganadas, cantidad total gastada, etc.
    const stats = {
      totalAuctions: await Auction.countDocuments({ creator: req.user.id }),
      totalBids: await Bid.countDocuments({ bidder: req.user.id }),
      // Agrega más estadísticas según necesites
    };

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
