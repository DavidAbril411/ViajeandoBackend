import express from 'express';
import { client } from "../../db.js";

const origenRouter = express.Router();

// Endpoint para obtener los orígenes
origenRouter.get("/", (_req, res) => {
  client.query("SELECT * FROM ORIGEN", (err, results) => {
    if (err) {
      console.error("Error al obtener los orígenes:", err);
      return res.status(500).json({ message: "Error al obtener los orígenes." });
    }

    res.status(200).json(results);
  });
});

export default origenRouter;
