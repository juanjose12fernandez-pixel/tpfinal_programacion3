// A partir de Node 22 en ESM podemos reducir la logica para basicamente crear el __dirname
// Logica para trabajar con archivos y rutas del proyecto

import { join } from "path";

// Apuntamos a la carpeta raiz del servidor "/". Tenemos que apuntar desde esta carpeta hasta la raiz, retroceder 3 niveles
const __dirname = join(import.meta.dirname, "../../../"); // Retrocedemos 3 niveles

// Categorias del rubro (tienen que coincidir con las que se cargan en la tabla products)
const categoriasValidas = ["perifericos", "audio"];

// Nombre de la empresa y de los alumnos (se muestran en todas las vistas .ejs)
const appInfo = {
    nombre: "Atacado Gamer",
    alumnos: "Nombre Apellido y Nombre Apellido" // TODO: poner los nombres del grupo
};

// Ahora ya, cuando traigamos __dirname en el index.js podremos construir las rutas que apunten a /utils y a /views
export {
    __dirname,
    join,
    categoriasValidas,
    appInfo
}
