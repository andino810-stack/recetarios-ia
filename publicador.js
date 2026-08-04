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

function obtenerTemaDelDia(){

    const hoy = new Date();

    const dia = hoy.getDay();

    return temas[dia];

}

console.log("==================================");
console.log("   PUBLICADOR AUTOMÁTICO IA");
console.log("==================================");
console.log("");


    async function iniciar(){

    console.log("✅ Gemini conectado");
    console.log("✅ Supabase conectado");

    const tema = obtenerTemaDelDia();

    console.log("");
    console.log("📅 Tema de hoy:", tema);
    console.log("");

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

No agregues texto fuera del JSON.
`
    });

    const receta = JSON.parse(respuesta.text);

    receta.imagen = "";
    receta.favorita = false;

    const { error } = await db
        .from("Recetas")
        .insert([receta]);

    if(error){
        console.log(error);
        return;
    }

    console.log("✅ Receta publicada correctamente.");

}

iniciar().catch(console.error);
