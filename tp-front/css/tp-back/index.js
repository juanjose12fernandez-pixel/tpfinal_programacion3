/*===============
    Imports
===============*/
import express from "express"; // Importamos el framework Express
import environments from "./src/api/config/environments.js"; // Traigo la info de la variables de entorno
import connection from "./src/api/database/db.js"; // Importo la conexion a la BBDD
import cors from "cors"; // Importamos el middleware CORS



/*===============
    Config
===============*/
const app = express(); // Crea una instancia de aplicacion de Express con todos sus metodos
const PORT = environments.port;

// TODO: poner aca las categorias del rubro que elijan (NO pueden ser de comida)
const CATEGORIAS_VALIDAS = ["categoria1", "categoria2"];



/*=================
    Middlewares
=================*/
app.use(cors()); // Middleware CORS basico para permitir todas las solicitudes

app.use(express.json()); // Middleware para parsear el JSON recibido en el cuerpo de las solicitudes POST y PUT

// Middleware logger para analizar las solicitudes por la consola
app.use((req, res, next) => {
    const fecha = new Date();
    console.log(`[${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}] ${req.method} ${req.url}`);
    next(); // Pasa al siguiente middleware (si lo hay) o a la respuesta
});

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

// Middleware (de ruta) para validar la informacion de los productos
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
    if (!CATEGORIAS_VALIDAS.includes(category)) {
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



/*===============
    Endpoints
===============*/
app.get("/", (req, res) => {
    res.send("Hola mundo desde un server de Express.js");
});


/*---------- PRODUCTOS ----------*/

// GET all products
app.get("/api/products", async (req, res) => {

    // Optimizacion 1: Manejo de errores con try catch
    try {

        // Optimizacion 2: No seleccionar todo, solo traer las columnas necesarias (mas eficiente en memoria, en red)
        // Ahora tambien traemos category porque el front arma las pestañas con ese campo
        const sql = "SELECT id, name, price, image, category, active FROM products";
        const [rows] = await connection.query(sql);

        // Optimizacion 3: Respuesta mas limpia con codigo semantico
        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron productos"
            });
        }

        res.status(200).json({
            payload: rows
        });

    } catch (error) {
        console.log("Error obteniendo productos: ", error);

        // Optimizacion 4: Error 500 si fallo la conexion a la BBDD
        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


// GET product by id
app.get("/api/products/:id", validateId, async (req, res) => {

    // Optimizacion 1: Validamos el id en el middleware (de ruta) validateId

    // Optimizacion 2: Manejo de errores con try catch
    try {

        // Optimizacion 3: Usamos placeholder "?" en lugar de interpolar el id en el string (previene SQL Injection)
        const sql = "SELECT id, name, price, image, category, active FROM products WHERE products.id = ?";

        const [rows] = await connection.query(sql, [req.id]);

        // Optimizacion 4: Devolvemos un codigo 404 para producto no encontrado
        if (rows.length === 0) {
            return res.status(404).json({
                message: `No se encontro producto con id: ${req.id}`
            });
        }

        res.status(200).json({
            payload: rows
        });

    } catch (error) {
        console.log("Error obteniendo productos por id: ", error);

        // Optimizacion 5: Error 500 si fallo la conexion a la BBDD
        res.status(500).json({
            message: "Error interno del servidor"
        });
    }

});


// POST product
app.post("/api/products", validateProduct, async (req, res) => {

    // Optimizacion 1: Validamos los datos del form en el middleware (de ruta) validateProduct

    // Optimizacion 2: Manejo de errores con try catch
    try {
        // Hacemos el destructuring de un objeto que parseamos previamente a traves del middleware express.json()
        const { category, image, name, price } = req.body;

        // Los placeholders "?" son una medida de seguridad para prevenir ataques de seguridad informatica como la inyeccion SQL
        const sql = "INSERT INTO products (name, image, category, price) VALUES (?, ?, ?, ?)";

        const [rows] = await connection.query(sql, [name, image, category, price]);

        res.status(201).json({
            message: "Producto creado exitosamente",
            productId: rows.insertId // Optimizacion 3: Le pasamos el nuevo id del prod
        });

    } catch (error) {
        console.log("Error creando un producto: ", error);

        // Optimizacion 4: Error 500 si fallo la conexion a la BBDD
        res.status(500).json({
            message: "Error interno del servidor"
        });
    }

});


// PUT product
app.put("/api/products", validateProduct, async (req, res) => {
    // Optimizacion 1: Validamos los datos del form en el middleware (de ruta) validateProduct

    // Optimizacion 2: Manejo de errores con try catch
    try {
        // Hacemos el destructuring de un objeto que parseamos previamente a traves del middleware express.json()
        const { category, image, name, price, active, id } = req.body;

        // validateProduct no revisa id ni active, los verificamos aca
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "El id debe ser un numero entero positivo"
            });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({
                message: "El campo active debe ser true o false"
            });
        }

        const sql = "UPDATE products SET name = ?, image = ?, price = ?, category = ?, active = ? WHERE id = ?";

        const [result] = await connection.query(sql, [name, image, price, category, active, id]);

        // Optimizacion 3: affectedRows indica si el producto existe (changedRows daria 0 tambien si mandan los mismos datos)
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Producto no encontrado"
            });
        }

        return res.status(200).json({
            message: "Producto actualizado correctamente"
        });

    } catch (error) {
        console.log("Error actualizando un producto: ", error);

        // Optimizacion 4: Error 500 si fallo la conexion a la BBDD
        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


// DELETE product (baja logica: active = false)
app.delete("/api/products/:id", validateId, async (req, res) => {

    // Optimizacion 1: Validamos el id en el middleware (de ruta) validateId

    // Optimizacion 2: Manejo de errores con try catch
    try {
        // Baja logica: no borramos la fila, solo la marcamos como inactiva (asi las ventas viejas no pierden el producto)
        const sql = "UPDATE products SET active = 0 WHERE id = ?";

        const [result] = await connection.query(sql, [req.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: `No se encontro producto con id: ${req.id}`
            });
        }

        res.status(200).json({
            message: `Producto con id ${req.id} desactivado exitosamente`
        });

    } catch (error) {
        console.log("Error desactivando producto: ", error);

        // Optimizacion 3: Error 500 si fallo la conexion a la BBDD
        res.status(500).json({
            message: "Error interno del servidor"
        });
    }

});


// PUT activate product (reactivar: active = true)
app.put("/api/products/:id/activate", validateId, async (req, res) => {

    try {
        const sql = "UPDATE products SET active = 1 WHERE id = ?";

        const [result] = await connection.query(sql, [req.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: `No se encontro producto con id: ${req.id}`
            });
        }

        res.status(200).json({
            message: `Producto con id ${req.id} activado exitosamente`
        });

    } catch (error) {
        console.log("Error activando producto: ", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }

});


/*---------- VENTAS ----------*/

// POST sale (lo usa el carrito del front al confirmar la compra)
app.post("/api/sales", validateSale, async (req, res) => {

    try {
        const { nombre, productos } = req.body;

        // No confiamos en los precios que manda el front: los buscamos en la BBDD y calculamos el total aca
        let total = 0;
        const items = [];

        for (const item of productos) {
            const sqlProducto = "SELECT id, price FROM products WHERE id = ? AND active = 1";
            const [rows] = await connection.query(sqlProducto, [item.id]);

            if (rows.length === 0) {
                return res.status(400).json({
                    message: `El producto con id ${item.id} no esta disponible`
                });
            }

            const precio = Number(rows[0].price);
            total += precio * item.cantidad;
            items.push({ id: item.id, cantidad: item.cantidad, precio });
        }

        // Guardamos la venta (la fecha la pone la BBDD con created_at)
        const sqlVenta = "INSERT INTO sales (customer_name, total) VALUES (?, ?)";
        const [venta] = await connection.query(sqlVenta, [nombre.trim(), total]);

        // Guardamos cada producto en la tabla intermedia (relacion muchos a muchos)
        for (const item of items) {
            const sqlItem = "INSERT INTO sales_products (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)";
            await connection.query(sqlItem, [venta.insertId, item.id, item.cantidad, item.precio]);
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

});


// GET all sales (cada venta con sus productos asociados)
app.get("/api/sales", async (req, res) => {

    try {
        const sql = `
            SELECT s.id, s.customer_name, s.total, s.created_at,
                   p.id AS product_id, p.name AS product_name, sp.quantity, sp.unit_price
            FROM sales s
            JOIN sales_products sp ON sp.sale_id = s.id
            JOIN products p ON p.id = sp.product_id
            ORDER BY s.created_at DESC, s.id DESC`;

        const [rows] = await connection.query(sql);

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

});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
});
