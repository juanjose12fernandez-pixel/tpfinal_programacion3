// ===== configuracion =====
const API_URL = "http://localhost:3000"; // puerto del backend
const APP_NAME = "Atacado Gamer";
const ALUMNOS = "Jesus Fernandez y Facundo Marchese"; // TODO: poner los nombres del grupo
const LOGO = "img/logo.jpg";

// ===== funciones para guardar y leer del localStorage =====
function leer(clave, defecto) {
    try {
        const valor = localStorage.getItem(clave);
        if (valor) {
            return JSON.parse(valor);
        }
        return defecto;
    } catch (error) {
        return defecto;
    }
}

function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

// formatea el precio
function dinero(n) {
    return "$" + Number(n).toLocaleString("es-AR");
}

// para que un texto de la base de datos no se interprete como html
function esc(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function urlImagen(img) {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return API_URL + "/" + img.replace(/^\//, "");
}

// ===== tema (oscuro / claro) =====
document.documentElement.dataset.theme = leer("tema", "dark");

function cambiarTema() {
    let nuevo = "dark";
    if (document.documentElement.dataset.theme === "dark") {
        nuevo = "light";
    }
    document.documentElement.dataset.theme = nuevo;
    guardar("tema", nuevo);
}

// ===== carrito =====
function getCarrito() {
    return leer("carrito", []);
}

function cantidadTotal() {
    let total = 0;
    getCarrito().forEach(function (item) {
        total += item.cantidad;
    });
    return total;
}

function totalCarrito() {
    let total = 0;
    getCarrito().forEach(function (item) {
        total += item.price * item.cantidad;
    });
    return total;
}

function agregarAlCarrito(producto) {
    const carrito = getCarrito();
    const item = carrito.find(function (i) { return i.id === producto.id; });

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            name: producto.name,
            price: Number(producto.price),
            image: producto.image,
            cantidad: 1
        });
    }
    guardar("carrito", carrito);
}

function quitarUnidad(id) {
    const carrito = getCarrito();
    const item = carrito.find(function (i) { return i.id === id; });
    if (!item) return;

    item.cantidad--;
    // si queda en 0 lo sacamos del carrito
    guardar("carrito", carrito.filter(function (i) { return i.cantidad > 0; }));
}

function eliminarDelCarrito(id) {
    guardar("carrito", getCarrito().filter(function (i) { return i.id !== id; }));
}

// ===== cosas que se repiten en todas las paginas =====

// sin nombre no se puede ver los productos, vuelve a la bienvenida
function protegerPagina() {
    if (!leer("nombre", null)) {
        location.href = "index.html";
    }
}

function actualizarContador() {
    const span = document.getElementById("contador");
    if (span) span.textContent = cantidadTotal();
}

function renderHeader() {
    document.getElementById("header").innerHTML = `
        <div class="marca">
            <img id="logo" class="logo" src="${LOGO}" alt="Logo de ${esc(APP_NAME)}">
            <div>
                <h1>${esc(APP_NAME)}</h1>
                <small>${esc(ALUMNOS)}</small>
            </div>
        </div>
        <nav class="nav">
            <a class="btn" href="index.html">Inicio</a>
            <a class="btn" href="productos.html">Productos</a>
            <a class="btn" href="carrito.html">Carrito (<span id="contador">${cantidadTotal()}</span>)</a>
            <a class="btn" href="${API_URL}/admin/login">Admin</a>
            <button class="btn" id="btn-tema" type="button">🌙/☀️ Tema</button>
        </nav>`;

    document.getElementById("btn-tema").addEventListener("click", cambiarTema);

    // si no esta el archivo del logo mostramos un cuadradito con las iniciales
    const logo = document.getElementById("logo");
    logo.addEventListener("error", function () {
        const cuadro = document.createElement("span");
        cuadro.className = "logo logo-texto";
        cuadro.textContent = "AG";
        logo.replaceWith(cuadro);
    });
}

// modal para confirmar: devuelve una promesa con true o false
function confirmar(titulo, texto) {
    return new Promise(function (resolve) {
        const fondo = document.createElement("div");
        fondo.className = "modal-fondo";
        fondo.innerHTML = `
            <div class="modal">
                <h2>${esc(titulo)}</h2>
                <p>${esc(texto)}</p>
                <div class="botones">
                    <button class="btn" data-r="0">Cancelar</button>
                    <button class="btn btn-primario" data-r="1">Confirmar</button>
                </div>
            </div>`;

        fondo.addEventListener("click", function (event) {
            const r = event.target.dataset.r;
            // si hizo click adentro del cuadro (que no es un boton) no hacemos nada
            if (r === undefined && event.target !== fondo) return;
            document.body.removeChild(fondo);
            resolve(r === "1");
        });

        document.body.appendChild(fondo);
    });
}
