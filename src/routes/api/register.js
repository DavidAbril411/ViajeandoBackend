import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../../db.js";

const registerRouter = express.Router();

// Endpoint para registrar un nuevo usuario
registerRouter.post("/", async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        if (!email || !contraseña) {
            return res.status(400).json({ message: "Email y contraseña son requeridos." });
        }

        // 1. Validar si el email ya está registrado
        const [existingUsers] = await client.query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "El email ya está en uso." });
        }

        // 2. Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // 3. Insertar el nuevo usuario
        const [result] = await client.query(
            "INSERT INTO usuarios (email, contraseña) VALUES (?, ?)",
            [email, hashedPassword]
        );

        const userId = result.insertId;

        // 4. Generar token JWT
        const secret = "mi_secreto"; // Idealmente usar process.env.JWT_SECRET
        const token = jwt.sign({ email, id: userId }, secret, { expiresIn: '1h' });

        // 5. Crear sesión en la base de datos
        // La fecha de expiración es opcional según tu esquema, aquí la dejamos NULL o calculamos 1h
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora
        await client.query(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
            [userId, token, expiresAt]
        );

        // 6. Enviar respuesta
        res.status(201).json({
            message: "Usuario registrado exitosamente.",
            token,
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error al registrar el usuario." });
    }
});

export default registerRouter;
