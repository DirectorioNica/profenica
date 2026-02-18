// =====================================
// ESTADO GLOBAL
// =====================================

let librosCache = [];
let librosMostrados = 0;

const LIBROS_POR_CARGA = 12;
const MAX_LIBROS_DOM = 60; // 🔥 límite seguro

let lazyLoadInstance = null;


// =====================================
// CARGAR JSON SOLO UNA VEZ
// =====================================

async function cargarLibros() {

    if (librosCache.length > 0) {
        mostrarMasLibros();
        return;
    }

    try {

        const response =
            await fetch("./data/biblioteca_mined_clean.json");

        librosCache = await response.json();

        document.getElementById("posts").innerHTML = "";

        mostrarMasLibros();

    } catch (error) {
        console.error("Error cargando libros:", error);
    }
}


// =====================================
// MOSTRAR LIBROS POR BLOQUES
// =====================================

function mostrarMasLibros() {

    const container = document.getElementById("posts");

    const nuevos = librosCache.slice(
        librosMostrados,
        librosMostrados + LIBROS_POR_CARGA
    );

    nuevos.forEach(libro => {

        const card = document.createElement("article");

        card.className =
            "bg-white rounded-lg shadow-md p-4 flex gap-4";

        card.innerHTML = `
            <img
                data-src="${libro.imagen}"
                class="lazy w-24 h-32 object-cover rounded-lg"
                alt="${libro.titulo}"
            >

            <div class="flex flex-col justify-between">
                <h3 class="font-semibold text-sm">
                    ${libro.titulo}
                </h3>

                ${
                    libro.pdf_url
                    ? `<a href="${libro.pdf_url}" target="_blank"
                        class="text-blue-600 mt-2 text-sm">
                        📖 Abrir PDF
                       </a>`
                    : ""
                }
            </div>
        `;

        container.appendChild(card);
    });

    librosMostrados += LIBROS_POR_CARGA;


    // =====================================
    // 🔥 CONTROL DE MEMORIA (FACEBOOK LITE)
    // =====================================
    while (container.children.length > MAX_LIBROS_DOM) {
        container.removeChild(container.firstChild);
    }


    // =====================================
    // ACTIVAR / ACTUALIZAR LAZYLOAD
    // =====================================
    if (!lazyLoadInstance) {
        lazyLoadInstance = new LazyLoad({
            elements_selector: ".lazy"
        });
    } else {
        lazyLoadInstance.update();
    }
}


// =====================================
// SCROLL INFINITO
// =====================================

window.addEventListener("scroll", () => {

    if (
        window.innerHeight + window.scrollY
        >= document.body.offsetHeight - 300
    ) {
        mostrarMasLibros();
    }

});
