const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ROOMS = require("./rooms");
const CHAT = require("./chat");

global.io = io;
global.CHAT = CHAT;

app.get("/", (req, res) => {
  res.redirect('https://karol-waliszewski.github.io/charades.io/');
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
    let room = ROOMS.getSocketRoom(socket);
    if (room)
      io.to(room.id).emit('receiveUsers', room.getUsers());
  });

  // Creating the room
  socket.on("createRoom", options => {
    ROOMS.createRoom(socket, options);
  });

  // Get Room
  socket.on("getRoom", id => {
    socket.emit("receiveRoom", ROOMS.getRoom(id));
  });

  // Joining Room
  socket.on("joinRoom", data => {
    if (ROOMS.joinRoom(socket, data.id, data.password)) {
      CHAT.sendServerMessage(data.id, `${socket.name} has joined the game!`);
      let room = ROOMS.getRoom(data.id);
      if (room.round != null) {
        socket.emit('getPainting', ROOMS.getRoom(data.id).round.lineHistory);
      }
    }
  });

  // Leaving Room
  socket.on("leaveRoom", () => {
    ROOMS.leaveRoom(socket);
  });

  // Getting Rooms
  socket.on("getRooms", () => {
    socket.emit("receiveRooms", ROOMS.getRooms());
  });

  socket.on("sendMessage", msg => {
    let room = ROOMS.getSocketRoom(socket);
    if (room) {
      CHAT.sendMessage(room.id, {
        msg,
        sender: socket.name
      });

      if (room.round != null && socket.id != room.painter) {
        // Checking if the message is correct
        if (room.round.check(msg)) {
          ROOMS.givePoints(socket);
          CHAT.sendCallback(socket, {
            self: `Congratulations! You've guessed the word!`,
            broadcast: `${socket.name} guessed the word (${room.round.word}) and earned 1 point!`
          });
          room.stopRound();
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
      socket.to(room.id).emit('paint', coords);
      room.round.addLine(coords);
    }
  });

  socket.on("clear", () => {
    let room = ROOMS.getSocketRoom(socket);
    if (room.painter == socket.id && room.round != null) {
      room.clearBoard();
    }
  });

  socket.on("wordChosen", word => {
    let room = ROOMS.getSocketRoom(socket);
    if (room.painter == socket.id && room.round == null) {
      room.startRound(word);
    }
  });
});

let port = process.env.PORT || 5050;

http.listen(port, () => {
  console.log(`Puns.io server is listening on port: ${port}`);
});

process.on("exit", function (code) {
  http.close();
  console.log("Server exit", code);
});