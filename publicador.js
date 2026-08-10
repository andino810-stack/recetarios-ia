require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const { createClient } = require("@supabase/supabase-js");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const temas = [
    "Panes",
    "Pastas",
    "Carnes",
    "Ensaladas",
    "Postres",
    "Pizzas",
    "Comida Regional"
];

function obtenerTemaDelDia() {
    const hoy = new Date();
    const dia = hoy.getDay();

    return temas[dia];
}

async function publicarEnFacebook(receta) {

    const pageId = process.env.FACEBOOK_PAGE_ID;
    const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !pageToken) {
        console.log("⚠️ Facebook no configurado.");
        return;
    }

    const mensaje = `🍴 NUEVA RECETA

${receta.nombre}

📂 Categoría: ${receta.categoria}

🥕 INGREDIENTES

${receta.ingredientes}

👨‍🍳 PREPARACIÓN

${receta.preparacion}

📖 Más recetas en https://andino810-stack.github.io/recetarios-ia/`;

    try {

        const respuesta = await fetch(
            `https://graph.facebook.com/v26.0/${pageId}/feed`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: mensaje,
                    access_token: pageToken
                })
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            console.log("❌ Error publicando en Facebook:");
            console.log(resultado);
            return;
        }

        console.log("✅ Receta publicada en Facebook.");
        console.log("🆔 ID publicación:", resultado.id);

    } catch (error) {

        console.log("❌ Error de conexión con Facebook:");
        console.log(error.message);

    }
}

console.log("==================================");
console.log("   PUBLICADOR AUTOMÁTICO IA");
console.log("==================================");
console.log("");

async function iniciar() {

    console.log("✅ Gemini conectado");
    console.log("✅ Supabase conectado");

    const tema = obtenerTemaDelDia();

    console.log("");
    console.log("📅 Tema de hoy:", tema);
    console.log("");

    const { data: recetasExistentes, error: errorLectura } = await db
        .from("Recetas")
        .select("nombre");

    if (errorLectura) {
        console.log("❌ Error leyendo recetas:", errorLectura);
        return;
    }

    const nombresExistentes = recetasExistentes.map(r =>
        r.nombre.toLowerCase().trim()
    );

    let receta = null;

    for (let intento = 1; intento <= 3; intento++) {

        console.log(`🤖 Intento ${intento} de 3`);

        const respuesta = await ai.models.generateContent({
            model: "gemini-flash-latest",

            contents: `
Devuelve únicamente un JSON válido.

{
  "nombre":"",
  "categoria":"",
  "ingredientes":"",
  "preparacion":""
}

Genera una receta profesional sobre el tema "${tema}".

La receta debe ser completamente diferente a las ya existentes.

NO repitas ninguno de estos nombres:

${nombresExistentes.join("\n")}

Si un nombre ya existe, inventa otra receta.

No agregues texto fuera del JSON.
`
        });

        try {

            receta = JSON.parse(respuesta.text);

        } catch (error) {

            console.log("❌ Gemini no devolvió un JSON válido.");
            receta = null;
            continue;
        }

        const nombreNuevo = receta.nombre
            .toLowerCase()
            .trim();

        if (!nombresExistentes.includes(nombreNuevo)) {

            console.log("✅ Receta nueva encontrada.");
            break;
        }

        console.log(
            `⚠️ "${receta.nombre}" ya existe. Reintentando...`
        );

        receta = null;
    }

    if (!receta) {

        console.log(
            "❌ No fue posible generar una receta nueva."
        );

        return;
    }

    receta.imagen = "";
    receta.favorita = false;

    const { error } = await db
        .from("Recetas")
        .insert([receta]);

    if (error) {

        console.log("❌ Error guardando receta:");
        console.log(error);

        return;
    }

    console.log("✅ Receta publicada correctamente en la web.");

    // Publicar solamente después de guardar correctamente en Supabase
    await publicarEnFacebook(receta);
}

iniciar().catch(console.error);
