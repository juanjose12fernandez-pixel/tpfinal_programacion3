/*=====================
    Rutas usuario
=====================*/

import { Router } from "express";
import { validateLogin, validateUser } from "../middlewares/middlewares.js";
import { createUser, loginUser } from "../controllers/user.controllers.js";


const router = Router();


/////////////////////////
// POST user (alta de administrador)
router.post("/", validateUser, createUser);



/////////////////////////
// POST login
router.post("/login", validateLogin, loginUser);



// Exportamos todas las rutas de usuario
export default router;
