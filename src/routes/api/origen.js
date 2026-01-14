import express from 'express';
import { client } from "../../db.js";

const origenRouter = express.Router();

// Endpoint para obtener los orígenes
origenRouter.get("/", async (_req, res) => {
  try {
    const [results] = await client.query("SELECT * FROM ORIGEN");
    res.status(200).json(results);
  } catch (err) {
    console.error("Error al obtener los orígenes:", err);
    res.status(500).json({ message: "Error al obtener los orígenes." });
  }
});

export default origenRouter;
