// ===============================
// RECETARIOS
// PARTE 1
// ===============================
let recetas = [];
let imagenBase64 = "";
const lista = document.getElementById("listaRecetas");

const formulario = document.getElementById("formulario");

const btnNueva = document.getElementById("btnNueva");

const btnCancelar = document.getElementById("cancelar");

const btnGuardar = document.getElementById("guardar");

const txtBuscar = document.getElementById("buscar");

const nombre = document.getElementById("nombre");

const categoria = document.getElementById("categoria");

const imagen = document.getElementById("imagen");

const ingredientes = document.getElementById("ingredientes");

const preparacion = document.getElementById("preparacion");

let editando = null;
let logueado = false;

async function verificarLogin(){

    const { data } = await db.auth.getSession();

    console.log(data.session);

    logueado = !!data.session;

    if(logueado){
        btnNueva.style.display = "";
    }else{
        btnNueva.style.display = "none";
    }

}

//------------------------------

btnNueva.onclick = () => {

formulario.classList.remove("oculto");

nombre.focus();

};

//------------------------------

btnCancelar.onclick = () => {

limpiarFormulario();
};

//------------------------------

function limpiarFormulario(){

    nombre.value="";

    categoria.value="";

    imagen.value="";

    imagenBase64="";

    ingredientes.value="";

    preparacion.value="";

    editando=null;

    formulario.classList.add("oculto");

}

imagen.addEventListener("change", function () {

    const archivo = this.files[0];

    if (!archivo) {
        imagenBase64 = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){

        const img = new Image();

        img.onload = function(){

            const canvas = document.createElement("canvas");

            const max = 800;

            let ancho = img.width;
            let alto = img.height;

            if(ancho > alto){

                if(ancho > max){
                    alto = alto * max / ancho;
                    ancho = max;
                }

            }else{

                if(alto > max){
                    ancho = ancho * max / alto;
                    alto = max;
                }

            }

            canvas.width = ancho;
            canvas.height = alto;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(img,0,0,ancho,alto);

            imagenBase64 = canvas.toDataURL("image/jpeg",0.7);

        };

        img.src = e.target.result;

    };

    lector.readAsDataURL(archivo);

});
//------------------------------

btnGuardar.onclick = async () => {

    if(nombre.value.trim()==""){
        alert("Ingrese un nombre.");
        return;
    }

    const urlImagen = await subirImagen();

    const receta = {

        id: Date.now(),

        nombre: nombre.value,

        categoria: categoria.value,

        imagen: urlImagen,

        ingredientes: ingredientes.value,

        preparacion: preparacion.value,

        favorita: false

    };


if(editando !== null){

    receta.id = recetas[editando].id;

}

const ok = await guardarDatos(receta);

if(!ok){

    return;

}

await cargarRecetas();

limpiarFormulario();

};
//------------------------------

async function guardarDatos(receta){

    let resultado;

    if(editando === null){

        resultado = await db
            .from("Recetas")
            .insert([receta]);

    }else{

        resultado = await db
            .from("Recetas")
            .update(receta)
            .eq("id", receta.id);

    }

    if(resultado.error){

        alert(resultado.error.message);

        return false;

    }

    return true;

}

//------------------------------

function mostrarRecetas(listaRecetas=recetas){

lista.innerHTML="";

if(listaRecetas.length===0){

lista.innerHTML="<h2>No hay recetas.</h2>";

return;

}

listaRecetas.forEach((r,i)=>{

const foto=r.imagen===""
?

"https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800"

:

r.imagen;

lista.innerHTML+=`

<div class="card"
onclick="location.href='receta.html?id=${r.id}'">

<img src="${foto}">

<div class="contenido">

<h3>${r.nombre}</h3>

<p><b>Categoría:</b> ${r.categoria}</p>

<p>

${r.ingredientes.substring(0,120)}...

</p>

<div class="botones">

<button
class="favorito"
${!logueado ? "disabled" : ""}
onclick="event.stopPropagation(); favorito(${i})">

${r.favorita ? "❤️":"🤍"}

</button>

${logueado ? `

<button
class="editar"
onclick="event.stopPropagation(); editar(${i})">

✏️

</button>

<button
class="eliminar"
onclick="event.stopPropagation(); eliminar(${i})">

🗑️

</button>

` : ""}

</div>

</div>

</div>

`;

});

}

mostrarRecetas();

// ===============================
// RECETARIOS
// PARTE 2
// ===============================

// Buscar recetas
txtBuscar.addEventListener("input", () => {

    const texto = txtBuscar.value.toLowerCase().trim();

    const resultado = recetas.filter(r =>

        r.nombre.toLowerCase().includes(texto) ||

        r.categoria.toLowerCase().includes(texto) ||

        r.ingredientes.toLowerCase().includes(texto)

    );

    mostrarRecetas(resultado);

});

//---------------------------------
async function eliminar(indice){

    if(!confirm("¿Eliminar esta receta?")){
        return;
    }

    const receta = recetas[indice];

    // Borrar imagen del Storage
    if(receta.imagen){

        const nombreArchivo = receta.imagen.split("/").pop();

const { error: errorImagen } = await db.storage
    .from("imagenes")
    .remove([nombreArchivo]);

console.log("Archivo:", nombreArchivo);
console.log("Error imagen:", errorImagen);

    }

    // Borrar receta
    const { error } = await db
        .from("Recetas")
        .delete()
        .eq("id", receta.id);

    if(error){
        alert(error.message);
        return;
    }

    await cargarRecetas();

}

//---------------------------------

function editar(indice){

    const r = recetas[indice];

    nombre.value = r.nombre;

    categoria.value = r.categoria;

    imagen.value = "";
imagenBase64 = r.imagen;

    ingredientes.value = r.ingredientes;

    preparacion.value = r.preparacion;

    editando = indice;

    formulario.classList.remove("oculto");

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

//---------------------------------

async function favorito(indice){

    const nuevoEstado = !recetas[indice].favorita;

    const { error } = await db
        .from("Recetas")
        .update({
            favorita: nuevoEstado
        })
        .eq("id", recetas[indice].id);

    if(error){

        alert(error.message);

        return;

    }

    recetas[indice].favorita = nuevoEstado;

    mostrarRecetas();

}

//---------------------------------

function mostrarFavoritas(){

    const fav = recetas.filter(r => r.favorita);

    mostrarRecetas(fav);

}

// ===============================
// RECETARIOS
// PARTE 3
// =============================



// Mostrar recetas al iniciar



async function probarConexion(){

    const { error } = await db
        .from("Recetas")
        .select("id")
        .limit(1);

    if(error){
        console.log("Error Supabase:", error);
    }else{
        console.log("✅ Conectado a Supabase");
    }

}

probarConexion();


cargarRecetas();
verificarLogin();



async function cargarRecetas(){

    const { data, error } = await db
    .from("Recetas")
    .select("*")
    .order("id");

    if(error){

        console.log(error);
        return;

    }

    recetas = data || [];

    mostrarRecetas();

}

async function subirImagen(){

    if(!imagen.files[0]){

        return imagenBase64;

    }

    const archivo = imagen.files[0];

    const nombreArchivo =
        Date.now()+"_"+archivo.name;

    const { error } = await db.storage
        .from("imagenes")
        .upload(nombreArchivo, archivo);

    if(error){

        alert("Error al subir la imagen");

        console.log(error);

        return "";

    }

    const { data } = db.storage
        .from("imagenes")
        .getPublicUrl(nombreArchivo);

    return data.publicUrl;

}

const btnLogin = document.getElementById("btnLogin");
const btnSalir = document.getElementById("btnSalir");

async function actualizarBotonesSesion(){

    const { data } = await db.auth.getSession();

    const logueado = !!data.session;

console.log("Sesión:", data.session);
console.log("Logueado:", logueado);

btnLogin.style.display = logueado ? "none" : "";
btnSalir.style.display = logueado ? "" : "none";

}

btnLogin.onclick = () => {

    location.href = "login.html";

};

btnSalir.onclick = async () => {

    await db.auth.signOut();

    btnLogin.style.display = "";
    btnSalir.style.display = "none";

    location.reload();

};

actualizarBotonesSesion();

db.auth.onAuthStateChange(() => {
    actualizarBotonesSesion();
});
