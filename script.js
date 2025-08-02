document.addEventListener("DOMContentLoaded", function () {
    let preguntas = [];
    let paginaActual = 0;
    const preguntasPorPagina = 103;

    async function cargarPreguntas() {
        try {
            const response = await fetch("preguntas_con_imagenes.json");
            preguntas = await response.json();
            mostrarPreguntas();
        } catch (error) {
            console.error("Error cargando las preguntas:", error);
        }
    }

    function mostrarPreguntas() {
        const contenedor = document.getElementById("contenedor-preguntas");
        contenedor.innerHTML = "";

        const inicio = paginaActual * preguntasPorPagina;
        const fin = inicio + preguntasPorPagina;
        const preguntasPagina = preguntas.slice(inicio, fin);

        preguntasPagina.forEach((pregunta, index) => {
            let preguntaHTML = `<div class="pregunta">
                ${pregunta.pregunta.replace(/\n/g, "<br>")}
            </div>`;

            
if (pregunta.imagenes && pregunta.imagenes.length > 0) {
    pregunta.imagenes.forEach(img => {
        preguntaHTML += `<img src="${img.url}" style="width: 100%; max-width: 600px; border-radius: 8px; margin-top: 10px; display: block;">`;
    });
}

            preguntaHTML += `<div class="opciones">`;

pregunta.opciones.forEach((opcion, opcionIndex) => {
    let inputId = `pregunta${inicio + index}_opcion${opcionIndex}`;
    let esUltimaRespuesta = (opcionIndex === pregunta.opciones.length - 1) ? "ultima-respuesta" : "";

    preguntaHTML += `
        <label for="${inputId}" class="opcion ${esUltimaRespuesta}" onclick="verificarRespuesta(this, '${opcion}', ${inicio + index})">
            <input type="${pregunta.respuestas_correctas.length > 1 ? 'checkbox' : 'radio'}" id="${inputId}" name="respuesta${inicio + index}" value="${opcion}" style="margin-right: 10px;">
            <span style="flex: 1;">${opcion}</span>
        </label>`;

    // Imagenes para preguntas específicas:
    const preguntasConImagenes = [34, 57, 59, 69, 98, 100, 104, 108, 114, 170, 171, 258];

    if (preguntasConImagenes.includes(inicio + index + 1) && pregunta.imagenes_respuesta) {
        const letra = opcion.trim().charAt(0);
        const imagenObj = pregunta.imagenes_respuesta.find(img => img.opcion === letra);
        if (imagenObj) {
            preguntaHTML += `<div style="margin-top:5px;">
                                <img src="${imagenObj.url}" style="max-width:100%; border-radius:8px;">
                             </div>`;
        }
    }
});

            preguntaHTML += `</div>`;
            contenedor.innerHTML += preguntaHTML;
        });

        document.getElementById("pagina-info").textContent = `Página ${paginaActual + 1} de ${Math.ceil(preguntas.length / preguntasPorPagina)}`;
        document.getElementById("anterior").disabled = paginaActual === 0;
        document.getElementById("siguiente").disabled = fin >= preguntas.length;
    }

    window.verificarRespuesta = function (elemento, opcionSeleccionada, index) {
        const pregunta = preguntas[index];
        const respuestasCorrectas = pregunta.respuestas_correctas.map(r => r.trim().toUpperCase());
        const seleccion = opcionSeleccionada.charAt(0).toUpperCase();
        const input = elemento.querySelector("input");

        if (input.type === "radio") {
            document.querySelectorAll(`[name='respuesta${index}']`).forEach(el => {
                el.parentNode.style.backgroundColor = "#ffffff";
                el.parentNode.style.color = "black";
            });
        }

        if (input.checked) {
            if (respuestasCorrectas.includes(seleccion)) {
                elemento.style.backgroundColor = "#2ecc71"; // ✅ Verde si es correcta
                elemento.style.color = "white";
            } else {
                elemento.style.backgroundColor = "#e74c3c"; // ❌ Rojo si es incorrecta
                elemento.style.color = "white";
            }
        } else {
            elemento.style.backgroundColor = "#ffffff";
            elemento.style.color = "black";
        }
    };

    document.getElementById("anterior").addEventListener("click", function () {
        if (paginaActual > 0) {
            paginaActual--;
            mostrarPreguntas();
        }
    });

    document.getElementById("siguiente").addEventListener("click", function () {
        if ((paginaActual + 1) * preguntasPorPagina < preguntas.length) {
            paginaActual++;
            mostrarPreguntas();
        }
    });

    cargarPreguntas();
});
