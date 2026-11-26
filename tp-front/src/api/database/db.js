import mysql from "mysql2/promise"; // Version con promesas de mysql2 (para usar async / await)
import environments from "../config/environments.js";

const { host, port, user, password, name } = environments.database;

// Conexion a la BBDD de XAMPP (MySQL)
const connection = mysql.createPool({
    host,
    port,
    user,
    password,
    database: name
});

export default connection;
