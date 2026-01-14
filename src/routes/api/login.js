import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    // Buscar el usuario por el email
    const [usuarios] = await client.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = usuarios[0];

    // Verificar la contraseña
    const isPasswordCorrect = await bcrypt.compare(contraseña, user.contraseña);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const payload = { id: user.id, email: user.email };
    const secret = "mi_secreto";
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    res.status(200).json({ message: "Login exitoso", token });
  } catch (_err) {
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
});

// Exportación por defecto
export default router;
