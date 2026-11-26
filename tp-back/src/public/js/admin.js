// Funciones compartidas por las vistas del administrador

// Si no hay sesion iniciada, volvemos al login
// (OJO: esto es solo una comprobacion del lado del cliente, no es seguridad real)
function protegerAdmin() {
    if (!localStorage.getItem("admin")) location.href = "/admin/login";
}

function cerrarSesion() {
    localStorage.removeItem("admin");
    location.href = "/admin/login";
}

// Modal de confirmacion: devuelve una promesa con true/false
function confirmar(titulo, texto) {
    return new Promise((resolve) => {
        const fondo = document.createElement("div");
        fondo.className = "modal-fondo";

        const modal = document.createElement("div");
        modal.className = "modal";

        const h2 = document.createElement("h2");
        h2.textContent = titulo;

        const p = document.createElement("p");
        p.textContent = texto;

        const botones = document.createElement("div");
        botones.className = "botones";
        botones.innerHTML = `
            <button class="btn btn-sec" data-r="0">Cancelar</button>
            <button class="btn btn-primario" data-r="1">Confirmar</button>`;

        modal.append(h2, p, botones);
        fondo.appendChild(modal);

        fondo.addEventListener("click", (event) => {
            const r = event.target.dataset.r;
            if (r === undefined && event.target !== fondo) return;
            document.body.removeChild(fondo);
            resolve(r === "1");
        });

        document.body.appendChild(fondo);
    });
}

// Muestra la lista de errores que devuelve la API
function mostrarErrores(elemento, datos) {
    const lista = datos.listaErrores ? datos.listaErrores.join(". ") : datos.message;
    elemento.textContent = lista || "Ocurrio un error";
}
