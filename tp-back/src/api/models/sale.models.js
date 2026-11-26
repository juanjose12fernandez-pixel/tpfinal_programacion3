/*============================
    Modelos venta
============================*/

import connection from "../database/db.js"; // Importo la conexion a la BBDD



////////////////////////////////
// Crear venta (la fecha la pone la BBDD con created_at)
const insertNewSale = (nombre, total) => {
    const sql = "INSERT INTO sales (customer_name, total) VALUES (?, ?)";

    return connection.query(sql, [nombre, total]);
}



////////////////////////////////
// Crear un registro en la tabla intermedia (relacion muchos a muchos entre ventas y productos)
const insertSaleProduct = (saleId, productId, quantity, unitPrice) => {
    const sql = "INSERT INTO sales_products (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)";

    return connection.query(sql, [saleId, productId, quantity, unitPrice]);
}



////////////////////////////////
// Seleccionar las ventas con sus productos (una fila por cada producto de cada venta)
const selectAllSales = () => {
    const sql = `
        SELECT s.id, s.customer_name, s.total, s.created_at,
               p.id AS product_id, p.name AS product_name, sp.quantity, sp.unit_price
        FROM sales s
        JOIN sales_products sp ON sp.sale_id = s.id
        JOIN products p ON p.id = sp.product_id
        ORDER BY s.created_at DESC, s.id DESC`;

    return connection.query(sql);
}


export default {
    insertNewSale,
    insertSaleProduct,
    selectAllSales
}
