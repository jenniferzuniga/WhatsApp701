var socket = io.connect("http://13.58.108.32@:5000");

var persona = document.getElementById("persona"),
  password = document.getElementById("password"),
  appChat = document.getElementById("app-chat"),
  panelBienvenida = document.getElementById("panel-bienvenida"),
  usuario = document.getElementById("usuario"),
  mensaje = document.getElementById("mensaje"),
  botonEnviar = document.getElementById("enviar"),
  escribiendoMensaje = document.getElementById("escribiendo-mensaje"),
  output = document.getElementById("output");

botonEnviar.addEventListener("click", function () {
  if (mensaje.value) {
    socket.emit("chat", {
      mensaje: mensaje.value,
      usuario: persona.value,
    });
  }
  mensaje.value = "";
});

mensaje.addEventListener("keyup", function () {
  if (persona.value) {
    socket.emit("typing", {
      nombre: persona.value,
      texto: mensaje.value,
    });
  }
});

socket.on("chat", function (data) {
  escribiendoMensaje.innerHTML = "";
  output.innerHTML +=
    "<p><strong>" + data.usuario + ": </strong>" + data.mensaje + "</p>";
});

socket.on("typing", function (data) {
  if (data.texto) {
    escribiendoMensaje.innerHTML =
      "<p><em>" + data.nombre + " está escribiendo un mensaje...</em></p>";
  } else {
    escribiendoMensaje.innerHTML = "";
  }
});

// Manejar la lógica de ingreso al chat
function ingresarAlChat() {
  if (persona.value && password.value) {
    socket.emit("login", {
      usuario: persona.value,
      password: password.value,
    });
  }
}

// Respuesta del servidor sobre el inicio de sesión
socket.on("loginResponse", function (data) {
  if (data.success) {
    panelBienvenida.style.display = "none";
    appChat.style.display = "block";
    usuario.value = persona.value;
    usuario.readOnly = true;
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});

// Recibir mensajes previos
socket.on("mensajes-previos", function (mensajes) {
  mensajes.forEach(function (mensaje) {
    output.innerHTML +=
      "<p><strong>" +
      mensaje.usuario +
      ": </strong>" +
      mensaje.mensaje +
      "</p>";
  });
});
