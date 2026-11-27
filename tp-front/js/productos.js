protegerPagina();
renderHeader();

const POR_PAGINA = 6;
let productos = [];
let categoria = "";
let pagina = 1;

const tabs = document.getElementById("tabs");
const grid = document.getElementById("grid");
const paginacion = document.getElementById("paginacion");
const mensaje = document.getElementById("mensaje");
const buscador = document.getElementById("buscador");

// pasa a minusculas y saca las tildes, para que "microfono" encuentre "Micrófono"
function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function categoriaDe(p) {
    return p.category || "Productos";
}

// Imagen alternativa local según el nombre del producto.
// Si la base de datos ya tiene una imagen válida, se sigue usando esa imagen.
function imagenAlternativa(p) {
    const nombre = String(p.name || "").toLowerCase();
    if (nombre.includes("bluetooth")) return "img/auriculares-bluetooth.svg";
    if (nombre.includes("microfono") || nombre.includes("micrófono")) return "img/microfono-usb.svg";
    if (nombre.includes("parlante")) return "img/parlante-portatil.svg";
    if (nombre.includes("barra")) return "img/barra-sonido.svg";
    if (nombre.includes("in-ear") || nombre.includes("inear")) return "img/auriculares-in-ear.svg";
    if (nombre.includes("auricular")) return "img/auriculares-microfono.svg";
    return "img/parlante-portatil.svg";
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(API_URL + "/api/products");
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.message || "Error en la API");
        }

        // solo mostramos los productos activos
        productos = datos.payload.filter(function (p) { return p.active; });

        if (productos.length === 0) {
            mensaje.textContent = "Todavía no hay productos disponibles.";
            return;
        }

        categoria = categoriaDe(productos[0]);
        dibujar();
    } catch (error) {
        mensaje.textContent = "No se pudieron cargar los productos: " + error.message;
    }
}

function dibujar() {
    // las pestañas salen de las categorias que hay en los productos
    const categorias = [];
    productos.forEach(function (p) {
        if (!categorias.includes(categoriaDe(p))) categorias.push(categoriaDe(p));
    });

    tabs.innerHTML = categorias.map(function (c) {
        // si estamos buscando, ninguna pestaña queda marcada
        const clase = (c === categoria && !buscador.value.trim()) ? "btn btn-primario" : "btn";
        return `<button class="${clase}" data-categoria="${esc(c)}">${esc(c)}</button>`;
    }).join("");

    // si hay texto en el buscador se busca en todos los productos, si no, solo en la categoria elegida
    const texto = normalizar(buscador.value.trim());
    let filtrados;
    if (texto) {
        filtrados = productos.filter(function (p) { return normalizar(p.name).includes(texto); });
    } else {
        filtrados = productos.filter(function (p) { return categoriaDe(p) === categoria; });
    }

    mensaje.textContent = filtrados.length === 0 ? "No se encontraron productos." : "";

    let totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
    if (totalPaginas < 1) totalPaginas = 1;
    if (pagina > totalPaginas) pagina = totalPaginas;

    const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    const carrito = getCarrito();

    grid.innerHTML = visibles.map(function (p) {
        const item = carrito.find(function (i) { return i.id === p.id; });
        const cantidad = item ? item.cantidad : 0;

        return `
        <article class="card">
            <img src="${esc(urlImagen(p.image) || urlImagen(imagenAlternativa(p)))}" alt="${esc(p.name)}" onerror="this.onerror=null; this.src='${esc(urlImagen(imagenAlternativa(p)))}';">
            <h3>${esc(p.name)}</h3>
            <p class="precio">${dinero(p.price)}</p>
            <div class="stepper">
                <button class="btn" data-accion="quitar" data-id="${p.id}">-</button>
                <span>${cantidad}</span>
                <button class="btn btn-primario" data-accion="agregar" data-id="${p.id}">+</button>
            </div>
        </article>`;
    }).join("");

    paginacion.innerHTML = `
        <button class="btn" data-pag="-1" ${pagina === 1 ? "disabled" : ""}>« Anterior</button>
        <span>Página ${pagina} de ${totalPaginas}</span>
        <button class="btn" data-pag="1" ${pagina === totalPaginas ? "disabled" : ""}>Siguiente »</button>`;

    actualizarContador();
}

tabs.addEventListener("click", function (event) {
    const boton = event.target.closest("button");
    if (!boton) return;
    categoria = boton.dataset.categoria;
    buscador.value = "";
    pagina = 1;
    dibujar();
});

grid.addEventListener("click", function (event) {
    const boton = event.target.closest("button");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === "agregar") {
        agregarAlCarrito(productos.find(function (p) { return p.id === id; }));
    } else {
        quitarUnidad(id);
    }
    dibujar();
});

paginacion.addEventListener("click", function (event) {
    const boton = event.target.closest("button");
    if (!boton) return;
    pagina = pagina + Number(boton.dataset.pag);
    dibujar();
});

buscador.addEventListener("input", function () {
    pagina = 1;
    dibujar();
});

cargarProductos();
