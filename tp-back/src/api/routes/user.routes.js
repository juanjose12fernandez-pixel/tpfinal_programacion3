/*=====================
    Rutas usuario
=====================*/

import { Router } from "express";
import { requireLogin, validateUser } from "../middlewares/middlewares.js";
import { createUser } from "../controllers/user.controllers.js";


const router = Router();


/////////////////////////
// POST user (alta de administrador, solo con sesion iniciada)
router.post("/", requireLogin, validateUser, createUser);



// Exportamos todas las rutas de usuario
export default router;
