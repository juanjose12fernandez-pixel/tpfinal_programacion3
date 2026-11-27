/*=====================
    Rutas autenticacion
=====================*/

import { Router } from "express";
import { loginAdmin, logoutAdmin, vistaLogin } from "../controllers/auth.controllers.js";

const router = Router();


router.get("/login", vistaLogin);

router.post("/login", loginAdmin);

router.post("/logout", logoutAdmin);

export default router;
