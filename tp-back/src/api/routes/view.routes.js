/*=====================
    Rutas vistas
=====================*/
import { Router } from "express";
import { requireLogin, validateId } from "../middlewares/middlewares.js";
import { vistaAlta, vistaAltaAdmin, vistaDashboard, vistaModificar } from "../controllers/view.controllers.js";
const router = Router();


// Todas las vistas del administrador piden sesion iniciada (requireLogin)
router.get("/dashboard", requireLogin, vistaDashboard);


router.get("/products/new", requireLogin, vistaAlta);


router.get("/users/new", requireLogin, vistaAltaAdmin);


router.get("/products/:id/edit", requireLogin, validateId, vistaModificar);

export default router;
