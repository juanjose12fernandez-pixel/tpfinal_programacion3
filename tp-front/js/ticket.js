renderHeader();

const ticket = leer("ticket", null);
const contenedor = document.getElementById("ticket");

if (!ticket) {
    location.href = "index.html";
} else {
    const fecha = new Date(ticket.fecha).toLocaleString("es-AR");

    const filas = ticket.items.map(function (i) {
        return `
        <tr>
            <td>${esc(i.name)}</td>
            <td>${i.cantidad}</td>
            <td>${dinero(i.price)}</td>
            <td>${dinero(i.price * i.cantidad)}</td>
        </tr>`;
    }).join("");

    contenedor.innerHTML = `
        <h2>🎮 ${esc(APP_NAME)}</h2>
        <p>Ticket de compra</p>
        <p><strong>Cliente:</strong> ${esc(ticket.nombre)}</p>
        <p><strong>Fecha:</strong> ${esc(fecha)}</p>
        <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
            <tbody>${filas}</tbody>
        </table>
        <p class="total">Total: ${dinero(ticket.total)}</p>
        <button class="btn btn-primario" id="btn-salir">Salir</button>`;

    document.getElementById("btn-salir").addEventListener("click", function () {
        // es un autoservicio: al salir se borra todo y arranca de nuevo
        localStorage.removeItem("nombre");
        localStorage.removeItem("carrito");
        localStorage.removeItem("ticket");
        location.href = "index.html";
    });
}
