// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Opciones de conexión recomendadas para MongoDB Atlas
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Atlas Conectado Exitosamente...');
    } catch (err) {
        console.error('Error al conectar a MongoDB Atlas:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
