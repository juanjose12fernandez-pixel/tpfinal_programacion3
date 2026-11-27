/*============================
    Controladores usuario
============================*/

import UserModels from "../models/user.models.js";
import bcrypt from "bcrypt"; // Importamos bcrypt para hashear las contrasenas


/////////////////////////
// POST user (alta de un usuario administrador)
export const createUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // El email no se puede repetir
        const [existentes] = await UserModels.selectUserByEmail(email);

        if (existentes.length > 0) {
            return res.status(409).json({
                message: "Ya existe un usuario con ese email"
            });
        }

        // Hasheamos la contrasena antes de guardarla (10 rondas de sal)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [rows] = await UserModels.insertNewUser(name.trim(), email, hashedPassword);

        res.status(201).json({
            message: "Usuario creado exitosamente",
            userId: rows.insertId
        });

    } catch (error) {
        console.log("Error creando un usuario: ", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}
