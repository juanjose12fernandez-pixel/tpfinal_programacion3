/*===============
    Imports
===============*/
import express from "express"; // Importamos el framework Express
import environments from "./src/api/config/environments.js"; // Traigo la info de la variables de entorno
import cors from "cors"; // Importamos el middleware CORS
import { loggerUrl } from "./src/api/middlewares/middlewares.js";
import { productRoutes, saleRoutes, userRoutes, viewRoutes } from "./src/api/routes/index.js";
import { join, __dirname, appInfo } from "./src/api/utils/index.js";



/*===============
    Config
===============*/
const app = express(); // Crea una instancia de aplicacion de Express con todos sus metodos
const PORT = environments.port || 3000; // Si el .env no tiene PORT, usamos el 3000
app.set("view engine", "ejs");  // Configuramos EJS como motor de plantillas
app.set("views", join(__dirname, "src/views")); // Apunto a la ruta desde la que se van a servir las vistas .ejs

app.locals.app = appInfo; // Nombre de la app y de los alumnos, disponibles en todas las vistas .ejs



/*=================
Middlewares
=================*/
app.use(cors()); // Middleware CORS basico para permitir todas las solicitudes

app.use(express.json()); // Middleware para parsear el JSON recibido en el cuerpo de las solicitudes POST y PUT

app.use(loggerUrl); // Middleware logger para analizar las solicitudes por la consola

app.use(express.static(join(__dirname, "src/public"))); // Middleware para servir archivos estaticos
// Podemos ver la imagen del logo desde http://localhost:3000/img/logo.jpg
// Podemos ver nuestro css en la ruta http://localhost:3000/css/styles.css -> esta es la hoja de estilos que consumen los .ejs

// Servimos tambien la tienda (tp-front) en http://localhost:3000/tienda/index.html
app.use("/tienda", express.static(join(__dirname, "../tp-front"), { dotfiles: "deny" }));



/*===============
    Rutas
===============*/
// Al entrar al sitio mostramos la pantalla de login del administrador
app.get("/", (req, res) => {
    res.redirect("/admin/login");
});

// Rutas producto
// El index.js redirige todas las peticiones de /api/products al archivo de product.routes.js
app.use("/api/products", productRoutes);

// Rutas venta
app.use("/api/sales", saleRoutes);

// Rutas usuario (alta de administrador y login)
app.use("/api/users", userRoutes);

// Rutas vistas
app.use("/admin", viewRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
});
