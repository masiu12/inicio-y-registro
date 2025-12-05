/* 
   VARIABLES GLOBALES (localStorage)

   - "intentos": cuenta los intentos fallidos de login.
   - "bloqueadoHasta": guarda el tiempo hasta el cual 
     el usuario no puede volver a intentar iniciar sesión.
 */
if (!localStorage.getItem("intentos")) {
    localStorage.setItem("intentos", "0");
}
if (!localStorage.getItem("bloqueadoHasta")) {
    localStorage.setItem("bloqueadoHasta", "0");
}
/* 
   buscar

   Permite buscar un usuario usando:
   - Su nombre de registro (key)
   - Su correo
   - Su celular
   Revisa cada usuario guardado y compara la entrada con los
   datos almacenados en formato: "pass,email,cel".
   Devuelve el usuario encontrado o nulo
*/
function buscarPorEmailOCel(entrada) {

    for (let i = 0; i < localStorage.length; i++) {

        let key = localStorage.key(i);
        let dataString = localStorage.getItem(key);

        if (key === "intentos" || key === "bloqueadoHasta") continue;

        // Convertir  en array
        let userDataArray = dataString.split(',');

        const PASS_INDEX = 0;
        const EMAIL_INDEX = 1;
        const CEL_INDEX = 2;

        if (userDataArray[EMAIL_INDEX] === entrada || userDataArray[CEL_INDEX] === entrada) {
            return { usuario: key, datosArray: userDataArray };
        }
    }
    return null;
}

/* 
   registrar
   Valida los campos usando expresiones regulares
   - Correo valido
   - Nombre con letras
   - Celular entre 7 y 12 dígitos
   - Contraseña segura (mayuscula minuscula, numero, simbolos

   Si todo esta correcto guarda la informacion 
    */

function registrar() {

    let u = document.getElementById("regUser").value;
    let email = document.getElementById("regEmail").value;
    let cel = document.getElementById("regCel").value;
    let p = document.getElementById("regPass").value;
    let p2 = document.getElementById("regPass2").value;
    let msg = document.getElementById("msgReg");
/* EXPLICACION DE EXPRESIONES REGULARES:
   
   const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   - ^: Inicio de la cadena.
   - [a-zA-Z0-9._%+-]+: Uno o mas caracteres permitidos antes del @.
   - @: El simbolo arroba.
   - [a-zA-Z0-9.-]+: Uno o mas caracteres para el dominio.
   - \.: Un punto literal.
   - [a-zA-Z]{2,}$/: La extension del dominio (minimo 2 letras) y fin de cadena.

   const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;

   - [A-Za-z... ]+: Una o mas letras (incluyendo Ñ y acentos) y espacios.
   
   const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
   - ^: Inicio de la cadena.
   - (?=.*[a-z]):  que requiere al menos una minuscula.
   - (?=.*[A-Z]):  que requiere al menos una mayuscula.
   - (?=.*\d):  que requiere al menos un digito (numero).
   - (?=.*[\W_]):  que requiere al menos un simbolo 
   - .{6,}: El total de la cadena debe tener al menos 6 caracteres de largo.
   
   const regexCel = /^[0-9]{7,12}$/;
   - ^: Inicio de la cadena.
   - [0-9]{7,12}: Solo digitos, minimo 7 y maximo 12 de largo.
   - $: Fin de la cadena.
*/
    // Expresiones regulares
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    const regexCel = /^[0-9]{7,12}$/;

    if (!u || !email || !cel || !p || !p2)
        return msg.innerText = "Completa todos los campos";
    if (!regexCorreo.test(email))
        return msg.innerText = "Correo inválido";
    if (!regexCel.test(cel))
        return msg.innerText = "Celular inválido (7 a 10 digitos)";
    if (!regexCorreo.test(u) && !regexNombre.test(u))
        return msg.innerText = "Usuario debe ser nombre o correo válido";
    if (!regexPass.test(p))
        return msg.innerText = "Contraseña insegura";
    if (p !== p2)
        return msg.innerText = "Las contraseñas no coinciden";

    // Guardar los datos
    let userDataString = [p, email, cel].join(',');
    localStorage.setItem(u, userDataString);

    msg.innerText = "Registro exitoso";
}


/* 
   login
   
   BLOQUEO:
    Suma 1 intento por cada contraseña incorrecta.
   
   VALIDACION:
   - Extrae la contraseña guardada y compara reinicando los intento
*/

function login() {

    let u = document.getElementById("loginUser").value;
    let p = document.getElementById("loginPass").value;
    let msg = document.getElementById("msgLogin");

    const PASS_INDEX = 0;

    let dataString = localStorage.getItem(u);
    let extra = buscarPorEmailOCel(u);

    if (!dataString && !extra)
        return msg.innerText = "Usuario no existe";


    let userDataArray = dataString ? dataString.split(',') : extra.datosArray;
    let usuarioReal = dataString ? u : extra.usuario;

    // BLOQUEO
    let intentos = parseInt(localStorage.getItem("intentos"));
    let bloqueadoHasta = parseInt(localStorage.getItem("bloqueadoHasta"));
    let ahora = Date.now();

    if (ahora < bloqueadoHasta) {
        msg.innerText = "Demasiados intentos. Intenta en " +
                        Math.ceil((bloqueadoHasta - ahora) / 1000) +
                        " segundos.";
        return;
    }

    //  intentos 
    if (intentos >= 3 && ahora >= bloqueadoHasta) {
        localStorage.setItem("intentos", "0");
        intentos = 0;
    }

    // VALIDACIO DE CONTRASEÑA
    if (userDataArray[PASS_INDEX] !== p) {
        intentos++;
        localStorage.setItem("intentos", intentos);

        if (intentos >= 3) {
            localStorage.setItem("bloqueadoHasta", ahora + 30000);
            return msg.innerText = "Fallaste 3 veces. Bloqueado 30s.";
        }

        return msg.innerText = `Contraseña incorrecta (${intentos}/3)`;
    }

    localStorage.setItem("intentos", "0");
    msg.innerText = "Bienvenido " + usuarioReal;
}

/* 
   recuperar
   
   Busca al usuario por nombre, correo o celular.
   Muestra la contraseña 
*/

function recuperar() {

    let u = document.getElementById("recUser").value;
    let msg = document.getElementById("msgRec");
    const PASS_INDEX = 0;

    let dataString = localStorage.getItem(u);
    let extra = buscarPorEmailOCel(u);

    if (!dataString && !extra)
        return msg.innerText = "Usuario no encontrado";

    let userDataArray = dataString ? dataString.split(',') : extra.datosArray;

    msg.innerText = "Tu contraseña es: " + userDataArray[PASS_INDEX];
}

/* 
    para mostrar o
   ocultar la contraseña.
*/

function toggle(id){
    let e = document.getElementById(id);
    e.type = (e.type === "password") ? "text" : "password";
}