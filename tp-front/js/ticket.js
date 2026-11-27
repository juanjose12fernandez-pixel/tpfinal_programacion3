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
        <button class="btn" id="btn-pdf">Descargar PDF</button>
        <button class="btn btn-primario" id="btn-salir">Salir</button>`;

    // arma el PDF del ticket con jsPDF y lo descarga
    document.getElementById("btn-pdf").addEventListener("click", function () {
        // si no hay internet la libreria no se carga
        if (!window.jspdf) {
            alert("No se pudo cargar la librería de PDF. Revisá tu conexión a internet.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;

        doc.setFontSize(20);
        doc.text(APP_NAME, 105, y, { align: "center" });
        y += 9;
        doc.setFontSize(12);
        doc.text("Ticket de compra", 105, y, { align: "center" });
        y += 15;

        doc.text("Cliente: " + ticket.nombre, 20, y);
        y += 7;
        doc.text("Fecha: " + fecha, 20, y);
        y += 12;

        // encabezado de la tabla
        doc.setFont("helvetica", "bold");
        doc.text("Producto", 20, y);
        doc.text("Cant.", 110, y);
        doc.text("Precio", 130, y);
        doc.text("Subtotal", 165, y);
        doc.setFont("helvetica", "normal");
        y += 3;
        doc.line(20, y, 190, y);
        y += 7;

        // una fila por producto
        ticket.items.forEach(function (i) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(String(i.name).substring(0, 38), 20, y);
            doc.text(String(i.cantidad), 110, y);
            doc.text(dinero(i.price), 130, y);
            doc.text(dinero(i.price * i.cantidad), 165, y);
            y += 7;
        });

        y += 3;
        doc.line(20, y, 190, y);
        y += 9;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Total: " + dinero(ticket.total), 190, y, { align: "right" });

        doc.save("ticket-atacado-gamer.pdf");
    });

    document.getElementById("btn-salir").addEventListener("click", function () {
        // es un autoservicio: al salir se borra todo y arranca de nuevo
        localStorage.removeItem("nombre");
        localStorage.removeItem("carrito");
        localStorage.removeItem("ticket");
        location.href = "index.html";
    });
}
