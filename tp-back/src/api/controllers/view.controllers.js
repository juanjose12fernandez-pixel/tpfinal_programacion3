/*============================
    Controladores vistas
============================*/

import ProductModels from "../models/product.models.js";
import { categoriasValidas } from "../utils/index.js";


//////////////////////
// Vista login
export const vistaLogin = (req, res) => {
    res.render("login");
}



//////////////////////
// Vista dashboard (listado de productos separados por categoria)
export const vistaDashboard = async (req, res) => {

    try {
        // Le solicitamos al modelo de productos todos los productos (activos e inactivos)
        const [rows] = await ProductModels.selectAllProducts();

        res.render("dashboard", {
            products: rows,
            categorias: categoriasValidas
        });

    } catch (error) {
        console.log("Error renderizando el dashboard: ", error);

        res.status(500).send("Error interno del servidor");
    }
}



//////////////////////
// Vista alta de producto
export const vistaAlta = (req, res) => {
    res.render("alta", {
        categorias: categoriasValidas
    });
}



//////////////////////
// Vista modificar producto
export const vistaModificar = async (req, res) => {

    try {
        const [rows] = await ProductModels.selectProductById(req.id);

        if (rows.length === 0) {
            return res.status(404).send(`No se encontro producto con id: ${req.id}`);
        }

        res.render("modificar", {
            product: rows[0],
            categorias: categoriasValidas
        });

    } catch (error) {
        console.log("Error renderizando la edicion: ", error);

        res.status(500).send("Error interno del servidor");
    }
}
