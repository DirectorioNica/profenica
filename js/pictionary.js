// ==============================
// VARIABLES
// ==============================
let palabras = [];
let index = 0;

const imagen = document.getElementById("imagen");
const palabra = document.getElementById("palabra");

// ==============================
// CARGAR JSON
// ==============================
async function cargarDatos() {

    try {

        const res = await fetch("../data/pictionary.json");
        palabras = await res.json();

        mostrar();

    } catch (error) {
        console.error("Error cargando pictionary:", error);
        palabra.textContent = "Error loading data";
    }
}

// ==============================
// MOSTRAR TARJETA
// ==============================
function mostrar() {

    if (palabras.length === 0) return;

    const item = palabras[index];

    imagen.src = item.img;
    palabra.textContent = item.word;
}

// ==============================
// NAVEGACION
// ==============================
document.getElementById("next").addEventListener("click", () => {

    index++;
    if (index >= palabras.length) index = 0;

    mostrar();
});

document.getElementById("prev").addEventListener("click", () => {

    index--;
    if (index < 0) index = palabras.length - 1;

    mostrar();
});

// ==============================
// INICIAR
// ==============================
cargarDatos();
