protegerPagina();
renderHeader();

const lista = document.getElementById("lista");
const resumen = document.getElementById("resumen");

function dibujar() {
    const carrito = getCarrito();

    if (carrito.length === 0) {
        lista.innerHTML = "<p>Tu carrito está vacío 😢</p>";
        resumen.innerHTML = `<a class="btn btn-primario" href="productos.html">Ver productos</a>`;
        actualizarContador();
        return;
    }

    lista.innerHTML = carrito.map(function (i) {
        return `
        <article class="fila">
            <img src="${esc(urlImagen(i.image))}" alt="${esc(i.name)}">
            <div class="fila-info">
                <h3>${esc(i.name)}</h3>
                <p>${dinero(i.price)} c/u</p>
            </div>
            <div class="stepper">
                <button class="btn" data-accion="quitar" data-id="${i.id}">-</button>
                <span>${i.cantidad}</span>
                <button class="btn btn-primario" data-accion="sumar" data-id="${i.id}">+</button>
            </div>
            <strong>${dinero(i.price * i.cantidad)}</strong>
            <button class="btn btn-peligro" data-accion="eliminar" data-id="${i.id}">Eliminar</button>
        </article>`;
    }).join("");

    resumen.innerHTML = `
        <p class="total">Total: ${dinero(totalCarrito())}</p>
        <a class="btn" href="productos.html">Seguir comprando</a>
        <button class="btn btn-primario" id="btn-finalizar">Finalizar compra</button>`;

    actualizarContador();
}

lista.addEventListener("click", function (event) {
    const boton = event.target.closest("button");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "sumar") {
        const item = getCarrito().find(function (i) { return i.id === id; });
        agregarAlCarrito(item);
    } else if (accion === "quitar") {
        quitarUnidad(id);
    } else {
        eliminarDelCarrito(id);
    }
    dibujar();
});

resumen.addEventListener("click", function (event) {
    if (event.target.id === "btn-finalizar") {
        finalizarCompra();
    }
});

async function finalizarCompra() {
    const ok = await confirmar(
        "Confirmar compra",
        "Vas a comprar " + cantidadTotal() + " producto(s) por " + dinero(totalCarrito())
    );
    if (!ok) return;

    const venta = {
        nombre: leer("nombre", ""),
        fecha: new Date().toISOString(),
        total: totalCarrito(),
        productos: getCarrito().map(function (i) {
            return { id: i.id, cantidad: i.cantidad, precio: i.price };
        })
    };

    // guardamos la venta en la base de datos a traves de la api
    try {
        const respuesta = await fetch(API_URL + "/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(venta)
        });
        if (!respuesta.ok) {
            console.warn("la api no guardo la venta:", respuesta.status);
        }
    } catch (error) {
        console.warn("no se pudo guardar la venta:", error);
    }

    guardar("ticket", { ...venta, items: getCarrito() });
    guardar("carrito", []);
    location.href = "ticket.html";
}

dibujar();
