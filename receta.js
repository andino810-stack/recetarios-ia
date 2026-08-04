const params = new URLSearchParams(window.location.search);

const id = Number(params.get("id"));

async function cargarReceta(){

    const { data: receta, error } = await db
        .from("Recetas")
        .select("*")
        .eq("id", id)
        .single();

    if(error || !receta){

        document.body.innerHTML =
        "<h2>Receta no encontrada.</h2>";

        return;

    }

    document.getElementById("foto").src =
        receta.imagen ||
        "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800";

    document.getElementById("nombre").innerText =
        receta.nombre;

    document.getElementById("categoria").innerText =
        "📂 " + receta.categoria;

    document.getElementById("ingredientes").innerText =
        receta.ingredientes;

    document.getElementById("preparacion").innerText =
        receta.preparacion;

    document.getElementById("compartir").onclick = () => {

        const texto =
`🍽️ ${receta.nombre}

📂 ${receta.categoria}

🥣 Ingredientes

${receta.ingredientes}

👨‍🍳 Preparación

${receta.preparacion}`;

        window.open(
            "https://wa.me/?text=" +
            encodeURIComponent(texto),
            "_blank"
        );

    };

}

cargarReceta();
