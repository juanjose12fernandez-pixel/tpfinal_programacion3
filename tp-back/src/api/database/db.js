// Conexion a la BBDD MySQL (XAMPP)
import mysql from "mysql2/promise"; // Version con promesas de mysql2 (para poder usar async / await)
import environments from "../config/environments.js";

const { host, name, user, password } = environments.database;

const connection = mysql.createPool({
    host,
    database: name,
    user,
    password
});

export default connection;
