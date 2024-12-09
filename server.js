// Importar módulos necesarios
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./db/config');

// Crear la aplicación de Express
const app = express();

// Conexión a la base de datos
dbConnection();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/studygroup', require('./routes/studygroup'));
app.use('/api/availability', require('./routes/availability'));

// Puerto y servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
