/*============================
    Modelos usuario
============================*/

import connection from "../database/db.js"; // Importo la conexion a la BBDD



////////////////////////////////
// Seleccionar un usuario por email
const selectUserByEmail = (email) => {
    const sql = "SELECT id, name, email, password FROM users WHERE email = ?";

    return connection.query(sql, [email]);
}



////////////////////////////////
// Crear usuario
const insertNewUser = (name, email, password) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    return connection.query(sql, [name, email, password]);
}


export default {
    selectUserByEmail,
    insertNewUser
}
