/*============================
    Controladores usuario
============================*/

import UserModels from "../models/user.models.js";


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

        // TODO: la contrasena se guarda tal cual llega. El cifrado (ej: bcrypt) se suma cuando se vea en clase
        const [rows] = await UserModels.insertNewUser(name.trim(), email, password);

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



/////////////////////////
// POST login (el login obtiene los datos del usuario de la BBDD)
export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;

        const [rows] = await UserModels.selectUserByEmail(email);

        // Mismo mensaje si no existe el email o si la contrasena no coincide (no damos pistas)
        if (rows.length === 0 || rows[0].password !== password) {
            return res.status(401).json({
                message: "Email o contrasena incorrectos"
            });
        }

        // Nunca devolvemos la contrasena
        res.status(200).json({
            message: "Login exitoso",
            payload: {
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email
            }
        });

    } catch (error) {
        console.log("Error en el login: ", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}
