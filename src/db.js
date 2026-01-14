import dotenv from 'dotenv';
dotenv.config();  // Cargar las variables de entorno

import mysql from "mysql2/promise";

// Crear la conexión con la base de datos
export const client = await mysql.createConnection({
  host: process.env.DB_HOST, // Usar las variables de entorno
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});
