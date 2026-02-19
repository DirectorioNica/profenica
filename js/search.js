let lunrIndex;
let libros = [];


// =============================
// CARGAR JSON
// =============================
async function cargarLibrosJSON() {

    const response =
        await fetch("./data/biblioteca_mined_clean.json");

    const data = await response.json();

    return data.map((libro, i) => ({
        id: i.toString(),
        titulo: normalizeText(libro.titulo || ""),
        categoria: normalizeText(libro.categoria || ""),
        pdf: libro.pdf_url || "",
        imagen: libro.imagen || ""
    }));
}


// =============================
// NORMALIZAR TEXTO
// =============================
function normalizeText(text) {
    return text
        ? text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/gi, "")
        : "";
}


// =============================
// CREAR INDICE
// =============================
async function initializeSearch() {

    libros = await cargarLibrosJSON();

    lunrIndex = lunr(function () {

        this.ref("id");
        this.field("titulo", { boost: 10 });
        this.field("categoria", { boost: 5 });

        libros.forEach(libro => {
            this.add(libro);
        });
    });
}


// =============================
// BUSCAR
// =============================
async function searchLibros(query) {

    if (!lunrIndex) {
        await initializeSearch();
    }

    const results =
        lunrIndex.search(normalizeText(query));

    return results.map(r =>
        libros.find(l => l.id === r.ref)
    );
}


// =============================
// EVENTO FORMULARIO
// =============================
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");
    const container = document.getElementById("resultsContainer");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const query = input.value.trim();

        if (!query) return;

        container.innerHTML =
            "<p class='text-gray-500'>Buscando...</p>";

        try {

            const resultados = await searchLibros(query);

            container.innerHTML = "";

            if (!resultados.length) {
                container.innerHTML =
                    "<p class='text-gray-500'>No se encontraron libros.</p>";
                return;
            }

            resultados.forEach(libro => {

                const card = document.createElement("div");

                card.className =
                    "bg-white p-4 rounded shadow-md mb-4 flex gap-4";

                card.innerHTML = `
                    <img src="${libro.imagen}"
                         class="w-20 h-28 object-cover rounded">

                    <div>
                        <h3 class="font-semibold">${libro.titulo}</h3>

                        <a href="${libro.pdf}" target="_blank"
                           class="text-blue-600 text-sm">
                           📖 Abrir PDF
                        </a>
                    </div>
                `;

                container.appendChild(card);
            });

        } catch (error) {
            console.error(error);
            container.innerHTML =
                "<p class='text-red-500'>Intente Buscar</p>";
        }
    });
});
