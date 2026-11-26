/*=====================
    Rutas venta
=====================*/

import { Router } from "express";
import { validateSale } from "../middlewares/middlewares.js";
import { createSale, getAllSales } from "../controllers/sale.controllers.js";


const router = Router();


/////////////////////////
// GET all sales
router.get("/", getAllSales);



/////////////////////////
// POST sale
router.post("/", validateSale, createSale);



// Exportamos todas las rutas de venta
export default router;
