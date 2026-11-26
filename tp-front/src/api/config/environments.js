import dotenv from "dotenv"; // Importamos dotenv para leer el archivo .env

dotenv.config(); // Carga las variables del .env en process.env

// Exportamos las variables de entorno ya ordenadas
export default {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME
    }
};
