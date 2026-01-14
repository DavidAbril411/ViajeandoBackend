import express from 'express';
import cors from 'cors'; // Importa cors
import destinosRouter from './routes/api/destinos.js';
import loginRouter from './routes/api/login.js';
import registerRouter from './routes/api/register.js';
import favoritosRouter from './routes/api/favoritos.js';
import origenRouter from './routes/api/origen.js';
import seedRouter from './routes/api/seed.js';

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || '*',
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
app.use('/api/seed', seedRouter); // Endpoint para poblar datos


app.use('/api/origen', origenRouter);


// Inicializar tabla de sesiones si no existe
const initDB = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(512) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);

    // Quick migration for image_url
    try { await client.query("ALTER TABLE DESTINOS ADD COLUMN IMAGE_URL VARCHAR(512)"); } catch (e) { /* ignore dup */ }
    try { await client.query("ALTER TABLE ORIGEN ADD COLUMN image_url VARCHAR(512)"); } catch (e) { /* ignore dup */ }

    console.log("DB verificada.");
  } catch (error) {
    console.error("Error al inicializar la DB:", error);
  }
};
initDB();

// Configurar el puerto del servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
