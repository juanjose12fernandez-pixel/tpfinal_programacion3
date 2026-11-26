/*=====================
    Rutas producto
=====================*/

import { Router } from "express";
import { validateId, validateProduct } from "../middlewares/middlewares.js";
import { createProduct, getActiveProducts, getAllProducts, getProductById, modifyProduct, reactivateProduct, removeProduct } from "../controllers/product.controllers.js";


const router = Router();


/////////////////////////
// GET active products
router.get("/active", getActiveProducts);


/////////////////////////
// GET all products
router.get("/", getAllProducts);



/////////////////////////
// GET product by id
router.get("/:id", validateId, getProductById);



/////////////////////////
// POST product
router.post("/", validateProduct, createProduct);



/////////////////////////
// PUT product
router.put("/", validateProduct, modifyProduct);



/////////////////////////
// PUT activate product
router.put("/:id/activate", validateId, reactivateProduct);



/////////////////////////
// DELETE product (baja logica)
router.delete("/:id", validateId, removeProduct);



// Exportamos todas las rutas de producto
export default router;
