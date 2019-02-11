const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ROOMS = require("./rooms");
const CHAT = require("./chat");

global.io = io;
global.CHAT = CHAT;

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", socket => {
  // Connect
  console.log(`User connected: ${socket.id}`);
  socket.name = socket.id;

  // Disconnect
  socket.on("disconnect", () => {
    ROOMS.leaveRoom(socket);
    console.log(`User disconnected: ${socket.id}`);
  });

  // Set socket's name
  socket.on("setName", name => {
    socket.name = name;
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
    if (ROOMS.joinRoom(socket, data.id, data.password)) {
      CHAT.sendServerMessage(data.id, `${socket.name} has joined the game!`);
      let room = ROOMS.getRoom(data.id);
      if (room.round != null) {
        socket.emit('getPainting', ROOMS.getRoom(data.id).round.lineHistory);
      }
    }
  });

  // Leaving Room
  socket.on("leave_room", () => {
    ROOMS.leaveRoom(socket);
  });

  // Getting Rooms
  socket.on("get_rooms", () => {
    socket.emit("receive_rooms", ROOMS.getRooms());
  });

  socket.on("send_message", msg => {
    let room = ROOMS.getSocketRoom(socket);
    if (room) {
      CHAT.sendMessage(room.id, {
        msg,
        sender: socket.name
      });

      if (room.round != null && socket.id != room.painter) {
        // Checking if the message is correct
        if (room.round.check(msg)) {
          room.stopRound();
          ROOMS.givePoints(socket);
          CHAT.sendCallback(socket, {
            self: `Congratulations! You've guessed the password!`,
            broadcast: `${socket.name} guessed the word and earned 1 point!`
          });
        } else {
          if (room.round.isClose(msg)) {
            CHAT.sendCallback(socket, {
              self: `You're so close!`
            });
          }
        }
      }
    }
  });

  socket.on("paint", (coords) => {
    let room = ROOMS.getSocketRoom(socket);
    if (room.painter == socket.id && room.round != null) {
      io.to(room.id).emit('paint', coords);
      room.round.addLine(coords);
    }
  });

  socket.on("clear", () => {
    let room = ROOMS.getSocketRoom(socket);
    if (room.painter == socket.id && room.round != null) {
      room.clearBoard();
    }
  });

  socket.on("word_chosen", word => {
    let room = ROOMS.getSocketRoom(socket);
    if (room.painter == socket.id && room.round == null) {
      console.log(word)
      room.startRound(word);
    }
  });
});

http.listen(5050, () => {
  console.log("Puns.io server is listening on port 5050");
});

process.on("exit", function (code) {
  http.close();
  console.log("Server exit", code);
});