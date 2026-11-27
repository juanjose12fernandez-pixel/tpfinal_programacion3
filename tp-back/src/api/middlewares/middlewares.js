/*=================
    Middlewares
=================*/

import { categoriasValidas } from "../utils/index.js";



// Middleware logger para analizar las solicitudes por la consola
const loggerUrl = (req, res, next) => {
    const fecha = new Date();
    console.log(`[${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}] ${req.method} ${req.url}`);
    next(); // Pasa al siguiente middleware (si lo hay) o a la respuesta
}



// Middleware (de ruta) para filtrar ids no validos
const validateId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "El id debe ser un numero entero positivo"
        });
    }

    req.id = id;
    next(); // Damos paso al siguiente middleware o a la response
}



// Middleware (de ruta) para validar la informacion de los formularios
const validateProduct = (req, res, next) => {

    const errores = [];

    const {name, image, price, category} = req.body;

    // Verificamos que mandamos todos los campos
    if (!name || !image || !price || !category) {
        errores.push("Faltan campos requeridos");
    }

    // Verificamos el campo nombre
    if (typeof name !== "string" || name.trim().length < 2) {
        errores.push("El nombre debe tener al menos 2 caracteres");
    }

    // Verificamos el campo precio
    if (typeof price !== "number" || price <= 0) {
        errores.push("El precio debe ser un numero mayor a 0");
    }

    // No validaremos image porque luego usaremos Multer

    // Verificaremos el campo category
    if(!categoriasValidas.includes(category)) {
        errores.push("Categoria invalida");
    }

    // Si hay algun error en la lista, directamente devolvemos un 400
    if (errores.length > 0) {
        return res.status(400).json({
            message: "Datos invalidos",
            listaErrores: errores
        });
    }

    next(); // Damos paso al siguiente middleware o a la response
}



// Middleware (de ruta) para validar la informacion de una venta
const validateSale = (req, res, next) => {

    const errores = [];

    const { nombre, productos } = req.body;

    // Verificamos el nombre del cliente
    if (typeof nombre !== "string" || nombre.trim().length < 2) {
        errores.push("El nombre debe tener al menos 2 caracteres");
    }

    // Verificamos la lista de productos
    if (!Array.isArray(productos) || productos.length === 0) {
        errores.push("La venta debe tener al menos un producto");
    } else {
        productos.forEach((p, i) => {
            if (!Number.isInteger(p.id) || p.id <= 0) {
                errores.push(`Producto ${i + 1}: id invalido`);
            }
            if (!Number.isInteger(p.cantidad) || p.cantidad <= 0) {
                errores.push(`Producto ${i + 1}: la cantidad debe ser un entero mayor a 0`);
            }
        });

        // La tabla sales_products no admite el mismo producto dos veces en una venta
        const idsUnicos = new Set(productos.map((p) => p.id));
        if (idsUnicos.size !== productos.length) {
            errores.push("Hay productos repetidos en la venta");
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            message: "Datos invalidos",
            listaErrores: errores
        });
    }

    next(); // Damos paso al siguiente middleware o a la response
}



// Middleware (de ruta) para validar la creacion de un usuario administrador
const validateUser = (req, res, next) => {

    const errores = [];

    const { name, email, password } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
        errores.push("El nombre debe tener al menos 2 caracteres");
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.push("El email no es valido");
    }

    if (typeof password !== "string" || password.length < 6) {
        errores.push("La contrasena debe tener al menos 6 caracteres");
    }

    if (errores.length > 0) {
        return res.status(400).json({
            message: "Datos invalidos",
            listaErrores: errores
        });
    }

    next(); // Damos paso al siguiente middleware o a la response
}



// Middleware de proteccion de rutas
const requireLogin = (req, res, next) => {

    // Chequeamos si existe una sesion creada, sino redirigimos a login
    if (!req.session.user) {
        return res.redirect("/admin/login");
    }

    // Damos paso al siguiente middleware o a la response
    next();
}



export {
    loggerUrl,
    validateId,
    validateProduct,
    validateSale,
    validateUser,
    requireLogin
}
