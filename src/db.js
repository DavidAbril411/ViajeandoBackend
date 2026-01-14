import dotenv from 'dotenv';
dotenv.config();  // Cargar las variables de entorno

import mysql from "mysql2/promise";

// Crear el pool de conexiones con la base de datos
export const client = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // Importante para bases de datos en la nube como Railway/PlanetScale
});
