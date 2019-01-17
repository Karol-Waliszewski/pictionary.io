const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const test = require("./rooms");

global.io = io;

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", socket => {
  // Connect
  console.log(`User connected: ${socket.id}`);

  // Disconnect
  socket.on("disconnect", () => {
    test.leaveRoom(socket);
    console.log(`User disconnected: ${socket.id}`);
  });

  // Hello
  socket.on("hello", msg => {
    console.log(`Hello: ${socket.id}, ${msg}`);
    io.emit("hello", msg);

    console.log(test.logUser());
  });

  // Creating the room
  socket.on("create_room", options => {
    test.createRoom(socket, options);
  });

  // Get Room
  socket.on("get_room", id => {
    socket.emit("receive_room", test.getRoom(id));
  });

  // Joining Room
  socket.on("join_room", data => {
    test.joinRoom(socket, data.id, data.password);
  });

  // Leaving Room
  socket.on("leave_room", () => {
    test.leaveRoom(socket);
  });

  // Getting Rooms
  socket.on("get_rooms", id => {
    socket.emit("receive_rooms", test.getRooms());
  });

});

http.listen(5050, () => {
  console.log("Puns.io server is listening on port 5050");
});

process.on("exit", function(code) {
  http.close();
  console.log("Server exit", code);
});
