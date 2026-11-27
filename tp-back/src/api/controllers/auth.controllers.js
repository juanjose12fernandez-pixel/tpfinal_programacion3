/*================================
    Controladores autenticacion
================================*/

import UserModels from "../models/user.models.js";
import bcrypt from "bcrypt";


/////////////////
// Renderizamos la vista del formulario login
export const vistaLogin = (req, res) => {
    res.render("login");
}


/////////////////
// Login del administrador (el formulario llega con express.urlencoded)
export const loginAdmin = async (req, res) => {

    try {
        const { email, password } = req.body;

        // Verificamos que llegaron los datos para no hacer una consulta innecesaria
        if (!email || !password) {
            return res.render("login", {
                error: "Ingresa el email y la contrasena"
            });
        }

        const [rows] = await UserModels.selectUserByEmail(email.trim());

        if (rows.length === 0) {
            return res.render("login", {
                error: "Email o contrasena incorrectos"
            });
        }

        const user = rows[0];

        // bcrypt compara la contrasena escrita con el hash guardado en la BBDD
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("login", {
                error: "Email o contrasena incorrectos"
            });
        }

        // Login correcto: creamos la sesion (nunca guardamos la contrasena)
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        }

        res.redirect("/admin/dashboard");

    } catch (error) {
        console.log("Error en el login: ", error);

        res.status(500).send("Error interno del servidor");
    }
}


/////////////////
// Logout: destruimos la sesion
export const logoutAdmin = (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.log("Error al destruir la sesion: ", err);

            return res.status(500).send("Error interno al cerrar la sesion");
        }

        res.redirect("/admin/login");
    });
}
