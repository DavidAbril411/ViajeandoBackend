import express from "express";
import { client } from "../../db.js";

const destinosRouter = express.Router();

// Obtener todos los destinos
destinosRouter.get("/", async (_req, res) => {
  try {
    const [destinos] = await client.query("SELECT * FROM DESTINOS");
    console.log(destinos);  // Verifica los datos obtenidos
    res.status(200).json(destinos);
  } catch (err) {
    console.error(err);  // Imprime el error si hay algún problema con la consulta
    res.status(500).json({ message: "Error al obtener los destinos.", error: err.message });
  }
});

// Obtener un destino por ID
destinosRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [destino] = await client.query("SELECT * FROM DESTINOS WHERE ID = ?", [id]);

    if (destino.length === 0) {
      return res.status(404).json({ message: "Destino no encontrado" });
    }

    res.status(200).json(destino[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el destino.", error: err.message });
  }
});

// Exportar el router para que sea usado en main.js
export default destinosRouter;
