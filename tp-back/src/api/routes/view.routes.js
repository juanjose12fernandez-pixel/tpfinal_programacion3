/*=====================
    Rutas vistas
=====================*/
import { Router } from "express";
import { validateId } from "../middlewares/middlewares.js";
import { vistaAlta, vistaDashboard, vistaLogin, vistaModificar } from "../controllers/view.controllers.js";
const router = Router();


router.get("/login", vistaLogin);


router.get("/dashboard", vistaDashboard);


router.get("/products/new", vistaAlta);


router.get("/products/:id/edit", validateId, vistaModificar);

export default router;
