const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/users
// @desc    Registrar usuario
// @access  Public
router.post('/', [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'El usuario ya existe' }] });
        }

        // Crear nuevo usuario
        user = new User({
            name,
            email,
            password,
            profileInfo: {
                avatar: null,
                bio: '',
                location: '',
                website: ''
            }
        });

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Guardar usuario
        await user.save();

        // Crear y retornar JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'mysecrettoken',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/users
// @desc    Obtener lista de usuarios
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ date: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE api/users
// @desc    Eliminar usuario
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // Eliminar usuario
        await User.findByIdAndRemove(req.user.id);
        res.json({ msg: 'Usuario eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT api/users
// @desc    Actualizar usuario
// @access  Private
router.put('/', [
    auth,
    [
        check('name', 'El nombre es requerido').not().isEmpty(),
        check('email', 'Por favor incluye un email válido').isEmail()
    ]
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, currentPassword, newPassword } = req.body;

        // Construir objeto de actualización
        const updateFields = { name, email };

        // Si se proporciona nueva contraseña, verificar la actual y actualizar
        if (currentPassword && newPassword) {
            const user = await User.findById(req.user.id);
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Contraseña actual incorrecta' }] });
            }

            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(newPassword, salt);
        }

        // Actualizar usuario
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
