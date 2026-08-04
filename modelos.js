require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const modelos = await ai.models.list();

  for (const modelo of modelos) {
    console.log(modelo.name);
  }
}

main().catch(console.error);
