/*============================
    Modelos producto
============================*/

import connection from "../database/db.js"; // Importo la conexion a la BBDD



////////////////////////////////
// Seleccionar productos activos
const selectActiveProducts = () => {
    const sql = "SELECT id, name, price, image, category, active FROM products WHERE active = ?";
    return connection.query(sql, [1]);
}


////////////////////////////////
// Seleccionar los productos
const selectAllProducts = () => {

    // Optimizacion 2: No seleccionar todo, solo traer las columnas necesarias (mas eficiente en memoria, en red)
    const sql = "SELECT id, name, price, image, category, active FROM products";
    return connection.query(sql);
}



////////////////////////////////
// Seleccionar un producto por id
const selectProductById = (id) => {

    // Optimizacion 4: No seleccionar todo, solo traer las columnas necesarias (mas eficiente en memoria, en red)
    const sql = `SELECT id, name, price, image, category, active FROM products WHERE products.id = ?`;

    // Retorna el resultado de la conexion
    return connection.query(sql, [id]);
}



////////////////////////////////
// Seleccionar un producto activo por id (lo usan las ventas para buscar el precio real)
const selectActiveProductById = (id) => {
    const sql = "SELECT id, price FROM products WHERE id = ? AND active = ?";
    return connection.query(sql, [id, 1]);
}



////////////////////////////////
// Crear producto
const insertProduct = (name, image, category, price) => {

    // Los placeholders "?" son una medida de seguridad para prevenir ataques de seguridad informatica como la inyeccion SQL
    const sql = "INSERT INTO products (name, image, category, price) VALUES (?, ?, ?, ?)";
    
    return connection.query(sql, [name, image, category, price]);
}



////////////////////////////////
// Actualizar producto
const updateProduct = (name, image, price, category, active, id) => {

    const sql = "UPDATE products SET name = ?, image = ?, price = ?, category = ?, active = ? WHERE id = ?";
    
    return connection.query(sql, [name, image, price, category, active, id]);
}



////////////////////////////////
// Desactivar producto (baja logica: no borramos la fila, solo cambiamos active a 0)
const deactivateProduct = (id) => {
    const sql = "UPDATE products SET active = ? WHERE id = ?";
    
    return connection.query(sql, [0, id]);
}



////////////////////////////////
// Reactivar producto
const activateProduct = (id) => {
    const sql = "UPDATE products SET active = ? WHERE id = ?";
    
    return connection.query(sql, [1, id]);
}


export default {
    selectAllProducts,
    selectProductById,
    selectActiveProducts,
    selectActiveProductById,
    insertProduct,
    updateProduct,
    deactivateProduct,
    activateProduct
}
