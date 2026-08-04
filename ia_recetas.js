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

async function main() {

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

Genera una receta original de pan.
No agregues texto fuera del JSON.
`
  });

  const receta = JSON.parse(respuesta.text);

  receta.imagen = "";
  receta.favorita = false;

  const { error } = await db
    .from("Recetas")
    .insert([receta]);

  if (error) {
    console.log(error);
    return;
  }

  console.log("✅ Receta agregada correctamente.");
}

main().catch(console.error);
