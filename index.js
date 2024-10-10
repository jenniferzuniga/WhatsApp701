const express = require("express");
const socket = require("socket.io");
const mongoose = require("mongoose");

// Conexión a MongoDB Atlas

mongoose
  .connect("mongodb+srv://jenn88zug08:W2TfCDWPsNLURXVT@jennifer701.phchf.mongodb.net/chatdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado a MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error de conexión a MongoDB Atlas:", err);
  });

// Esquema y modelo de Mongoose para los mensajes de chat
const chatSchema = new mongoose.Schema({
  usuario: String,
  mensaje: String,
  fecha: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

// Esquema y modelo de Mongoose para los usuarios
const userSchema = new mongoose.Schema({
  usuario: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();
const server = app.listen(5000, "0.0.0.0", function () {
  console.log("Servidor activo en el puerto 5000");
});

// Indicar que use una ubicación para los archivos de la vista
app.use(express.static("public"));

// Inicializar Socket.IO
const io = socket(server);

io.on("connection", function (socket) {
  console.log("Hay una conexión:", socket.id);

  // Escuchar el evento 'login' para verificar credenciales
  socket.on("login", async function (data) {
    const { usuario, password } = data;
    try {
      // Buscar el usuario en la base de datos
      const user = await User.findOne({ usuario, password });
      if (user) {
        socket.emit("loginResponse", { success: true });
        // Recuperar los mensajes del usuario que ha iniciado sesión
        const mensajes = await ChatMessage.find({ usuario })
          .sort({ fecha: 1 })
          .limit(10);
        socket.emit("mensajes-previos", mensajes);
      } else {
        socket.emit("loginResponse", { success: false });
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Escuchar evento 'chat' y guardar mensaje en la base de datos
  socket.on("chat", async function (data) {
    try {
      const nuevoMensaje = new ChatMessage({
        usuario: data.usuario,
        mensaje: data.mensaje,
      });
      await nuevoMensaje.save();
      io.sockets.emit("chat", data); // Envía el mensaje a todos los usuarios
    } catch (err) {
      console.error(err);
    }
  });

  // Escuchar evento 'typing'
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});
