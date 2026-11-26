/*============================
    Controladores venta
============================*/

import ProductModels from "../models/product.models.js";
import SaleModels from "../models/sale.models.js";


/////////////////////////
// POST sale (lo usa el carrito del front al confirmar la compra)
export const createSale = async (req, res) => {

    try {
        const { nombre, productos } = req.body;

        // No confiamos en los precios que manda el front: los buscamos en la BBDD y calculamos el total aca
        let total = 0;
        const items = [];

        for (const item of productos) {
            const [rows] = await ProductModels.selectActiveProductById(item.id);

            if (rows.length === 0) {
                return res.status(400).json({
                    message: `El producto con id ${item.id} no esta disponible`
                });
            }

            const precio = Number(rows[0].price);
            total += precio * item.cantidad;
            items.push({ id: item.id, cantidad: item.cantidad, precio });
        }

        // Guardamos la venta
        const [venta] = await SaleModels.insertNewSale(nombre.trim(), total);

        // Guardamos cada producto en la tabla intermedia
        for (const item of items) {
            await SaleModels.insertSaleProduct(venta.insertId, item.id, item.cantidad, item.precio);
        }

        res.status(201).json({
            message: "Venta registrada exitosamente",
            saleId: venta.insertId,
            total
        });

    } catch (error) {
        console.log("Error registrando la venta: ", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}



/////////////////////////
// GET all sales (cada venta con sus productos asociados)
export const getAllSales = async (req, res) => {

    try {
        const [rows] = await SaleModels.selectAllSales();

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron ventas"
            });
        }

        // La consulta devuelve una fila por producto, las agrupamos por venta
        const ventas = {};

        rows.forEach((fila) => {
            if (!ventas[fila.id]) {
                ventas[fila.id] = {
                    id: fila.id,
                    customer_name: fila.customer_name,
                    total: fila.total,
                    created_at: fila.created_at,
                    productos: []
                };
            }

            ventas[fila.id].productos.push({
                id: fila.product_id,
                name: fila.product_name,
                quantity: fila.quantity,
                unit_price: fila.unit_price
            });
        });

        res.status(200).json({
            payload: Object.values(ventas)
        });

    } catch (error) {
        console.log("Error obteniendo ventas: ", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}
