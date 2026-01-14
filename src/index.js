import express from 'express';
import cors from 'cors'; // Importa cors
import destinosRouter from './routes/api/destinos.js';
import loginRouter from './routes/api/login.js';
import registerRouter from './routes/api/register.js';
import favoritosRouter from './routes/api/favoritos.js';
import origenRouter from './routes/api/origen.js';

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://viajeando.com.ar', // Acepta solicitudes del dominio principal
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));



// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Configurar las rutas con diferentes prefijos
app.use('/api/destinos', destinosRouter);
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api/favoritos', favoritosRouter);
app.use('/api/origen', origenRouter);


// Configurar el puerto del servidor
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
