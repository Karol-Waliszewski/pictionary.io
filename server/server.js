const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ROOMS = require("./rooms");
const CHAT = require("./chat");

global.io = io;

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", socket => {
  // Connect
  console.log(`User connected: ${socket.id}`);

  // Disconnect
  socket.on("disconnect", () => {
    ROOMS.leaveRoom(socket);
    console.log(`User disconnected: ${socket.id}`);
  });

  // Hello
  socket.on("hello", msg => {
    console.log(`Hello: ${socket.id}, ${msg}`);
    io.emit("hello", msg);

    console.log(ROOMS.logUser());
  });

  // Creating the room
  socket.on("create_room", options => {
    ROOMS.createRoom(socket, options);
  });

  // Get Room
  socket.on("get_room", id => {
    socket.emit("receive_room", ROOMS.getRoom(id));
  });

  // Joining Room
  socket.on("join_room", data => {
    if (ROOMS.joinRoom(socket, data.id, data.password))
      CHAT.sendServerMessage(data.id, `${socket.id} has joined the game!`);
  });

  // Leaving Room
  socket.on("leave_room", () => {
    ROOMS.leaveRoom(socket);
  });

  // Getting Rooms
  socket.on("get_rooms", id => {
    socket.emit("receive_rooms", ROOMS.getRooms());
  });

  socket.on("send_message", msg => {
    let room = ROOMS.getSocketRoom(socket);
    if (room) CHAT.sendMessage(room.id, { msg, sender: socket.id });
  });
});

http.listen(5050, () => {
  console.log("Puns.io server is listening on port 5050");
});

process.on("exit", function(code) {
  http.close();
  console.log("Server exit", code);
});
