import express from "express";
import { client } from "../../db.js";

const favoritosRouter = express.Router();

// Endpoint para sincronizar los favoritos de un usuario
favoritosRouter.patch("/sync", async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud (un solo favorito)
    const { id_usuario, id_destino, is_favorited } = req.body;

    console.log("Datos recibidos:", { id_usuario, id_destino, is_favorited });

    // Validación: verificar que se reciban todos los datos necesarios
    if (!id_usuario || !id_destino || typeof is_favorited !== 'boolean') {
      const message = "Se requiere un id_usuario, id_destino y el estado is_favorited.";
      console.log(message);
      return res.status(400).json({ message });
    }

    // Verificar si el destino ya está registrado como favorito para el usuario
    const [existing] = await client.query(
      "SELECT * FROM FAVORITOS WHERE ID_USUARIO = ? AND ID_DESTINO = ?",
      [id_usuario, id_destino]
    );

    if (existing.length > 0) {
      // Si ya existe la relación, actualizamos el estado de favorito
      console.log(`El destino ${id_destino} ya existe para el usuario ${id_usuario}. Actualizando estado.`);
      await client.query(
        "UPDATE FAVORITOS SET IS_FAVORITED = ? WHERE ID_USUARIO = ? AND ID_DESTINO = ?",
        [is_favorited, id_usuario, id_destino]
      );
    } else {
      // Si no existe, lo creamos con el estado proporcionado
      console.log(`El destino ${id_destino} no existe para el usuario ${id_usuario}. Creando relación.`);
      await client.query(
        "INSERT INTO FAVORITOS (ID_USUARIO, ID_DESTINO, IS_FAVORITED) VALUES (?, ?, ?)",
        [id_usuario, id_destino, is_favorited]
      );
    }

    // Responder con éxito
    const message = `El destino ${id_destino} ha sido ${is_favorited ? "marcado" : "desmarcado"} correctamente.`;
    console.log(message);
    return res.status(200).json({ message });
  } catch (err) {
    console.error("Error al sincronizar el favorito:", err);

    // Manejar errores inesperados
    return res.status(500).json({ message: "Error al sincronizar el favorito." });
  }
});

// Endpoint para obtener los favoritos de un usuario por su id
favoritosRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener los destinos favoritos del usuario por id
    const [favoritos] = await client.query(
      "SELECT d.* FROM FAVORITOS f JOIN DESTINOS d ON f.ID_DESTINO = d.ID WHERE f.ID_USUARIO = ? AND f.IS_FAVORITED = 1",
      [id]
    );

    // Si no hay favoritos, devuelve un array vacío
    res.status(200).json(favoritos.length > 0 ? favoritos : []);
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    return res.status(500).json({ message: "Error al obtener los favoritos." });
  }
});

// Exportar el router para que sea usado en main.js
export default favoritosRouter;
