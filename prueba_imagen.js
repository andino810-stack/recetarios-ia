require("dotenv").config();

const axios = require("axios");
const fs = require("fs");

async function main() {

    console.log("Generando imagen...");

    const respuesta = await axios({
        url: "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        method: "POST",
        responseType: "arraybuffer",
        headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json"
        },
        data: {
            inputs: "Pan artesanal recién horneado sobre una mesa de madera, fotografía profesional gastronómica, luz natural."
        }
    });

    fs.writeFileSync("imagen.png", respuesta.data);

    console.log("✅ Imagen creada: imagen.png");

}

main().catch(console.error);
