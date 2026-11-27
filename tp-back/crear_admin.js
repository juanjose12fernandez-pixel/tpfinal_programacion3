// Crea (o actualiza) el administrador de prueba con la contrasena hasheada con bcrypt
// Uso: node crear_admin.js
import bcrypt from "bcrypt";
import connection from "./src/api/database/db.js";

const hashedPassword = await bcrypt.hash("admin123", 10);

await connection.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)",
    ["Administrador", "admin@admin.com", hashedPassword]
);

console.log("Administrador creado: admin@admin.com / admin123");
process.exit();
