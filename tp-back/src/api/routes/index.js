// Archivo de barril que centraliza y exporta todas nuestra rutas

// Importe todas las rutas de product.routes.js con el nombre productRoutes
import productRoutes from "./product.routes.js"; 
import saleRoutes from "./sale.routes.js";
import userRoutes from "./user.routes.js";
import viewRoutes from "./view.routes.js";


// Exporto todas las rutas que centralice aca, en el archivo de barril
export {
    productRoutes,
    saleRoutes,
    userRoutes,
    viewRoutes
}
