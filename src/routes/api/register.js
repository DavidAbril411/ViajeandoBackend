import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../../db.js";

const registerRouter = express.Router();

// Endpoint para registrar un nuevo usuario
registerRouter.post("/", async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        // Validar si el email ya está registrado
        client.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error("Error al verificar el email:", err);
                return res.status(500).json({ message: "Error al verificar el email." });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "El email ya está en uso.",
                });
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10); // Salting factor = 10

            // Insertar el nuevo usuario en la base de datos
            client.query(
                "INSERT INTO usuarios (email, contraseña) VALUES (?, ?)",
                [email, hashedPassword],
                (err, _result) => {
                    if (err) {
                        console.error("Error al registrar el usuario:", err);
                        return res.status(500).json({ message: "Error al registrar el usuario." });
                    }

                    // Generar token JWT después del registro exitoso
                    const payload = { email, id: _result.insertId }; // Usamos el id recién insertado
                    const secret = "mi_secreto";
                    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

                    // Enviar respuesta con el token
                    res.status(201).json({
                        message: "Usuario registrado exitosamente.",
                        token,
                    });
                }
            );
        });
    } catch (_err) {
        console.error("Error en el registro:", _err);
        res.status(500).json({ message: "Error al registrar el usuario." });
    }
});

export default registerRouter;
