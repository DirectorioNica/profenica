let lunrIndex;
let posts = []; // Almacén de documentos originales para referencias

// Inicializar Lunr.js con configuraciones específicas y cargar publicaciones
async function initializeSearch() {
    posts = await fetchAllPosts(); // Cargar publicaciones en memoria

    // Crear índice de Lunr.js
    lunrIndex = lunr(function () {
        this.ref("id"); // Identificador único para cada post
        this.field("content", { boost: 10 }); // Campo principal con mayor peso
        this.field("category", { boost: 5 }); // Campo de categoría con peso medio
        this.field("author", { boost: 2 }); // Autor con menor peso

        posts.forEach((post) => {
            this.add(post); // Agregar cada publicación al índice
        });
    });
}

// Obtener todas las publicaciones desde la base de datos
async function fetchAllPosts() {
    const Post = Parse.Object.extend("Post");
    const query = new Parse.Query(Post);
    query.include("author");

    try {
        const results = await query.find();
        return results.map((post) => ({
            id: post.id,
            content: normalizeText(post.get("content")),
            category: normalizeText(post.get("category")),
            author: post.get("author") ? post.get("author").get("username") : "Desconocido",
            enlace: post.get("link") || "No disponible",
        }));
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        return [];
    }
}

// Normalizar texto para mejorar la búsqueda
function normalizeText(text) {
    return text ? text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/gi, "") : "";
}

// Función para realizar la búsqueda con Lunr.js
async function searchPosts(query) {
    if (!lunrIndex) {
        await initializeSearch();
    }

    const normalizedQuery = normalizeText(query); // Normalizar entrada del usuario
    const results = lunrIndex.search(normalizedQuery); // Buscar en el índice

    // Retornar documentos originales basados en las referencias
    return results.map((result) => posts.find(post => post.id === result.ref));
}

// Manejar eventos del formulario de búsqueda
document.addEventListener("DOMContentLoaded", async () => {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("resultsContainer");

    if (searchForm) {
        searchForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();

            if (!query) {
                resultsContainer.innerHTML = "<p class='text-gray-500'>Por favor, ingresa un término de búsqueda.</p>";
                return;
            }

            resultsContainer.innerHTML = "<p class='text-gray-500'>Buscando...</p>";

            try {
                const results = await searchPosts(query);

                resultsContainer.innerHTML = "";

                if (results.length === 0) {
                    resultsContainer.innerHTML = "<p class='text-gray-500'>No se encontraron resultados.</p>";
                } else {
                    results.forEach((result) => {
                        const postElement = document.createElement("div");
                        postElement.className = "bg-white p-4 rounded shadow-md mb-4";
                        postElement.innerHTML = `
                            <h3 class="text-lg font-semibold">${result.content}</h3>
                            <p class="text-sm text-gray-500 mt-2">Categoría: ${result.category}</p>
                            <p class="text-sm text-gray-500 mt-1">Autor: ${result.author}</p>
                            <p class="text-sm text-gray-500 mt-1">Enlace: <a href="${result.enlace}" target="_blank" class="text-blue-500 hover:underline">Enlace</a></p>
                        `;
                        resultsContainer.appendChild(postElement);
                    });
                }
            } catch (error) {
                console.error("Error al buscar publicaciones:", error);
                resultsContainer.innerHTML = "<p class='text-red-500'>Hubo un error al buscar. Inténtalo nuevamente.</p>";
            }
        });
    }
});
