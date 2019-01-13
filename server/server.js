const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const createID = require("uniqid");

var ROOMS = {};

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/rooms", (req, res) => {
  let rooms = [];
  for(let room in ROOMS){
    rooms.push(Object.assign(ROOMS[room],{id:room}));
  }
  res.json(rooms);
});

io.on("connection", socket => {
  // Connect
  console.log(`User connected: ${socket.id}`);

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Hello
  socket.on("hello", msg => {
    console.log(`Hello: ${socket.id}, ${msg}`);
    io.emit("hello", msg);

    console.log(ROOMS);
  });

  // Creating the room
  socket.on("create_room", options => {
    if (typeof options.name != "undefined" || options.name.length <= 0) {
      let roomID = createID();

      let room = {
        name: options.name,
        isPrivate: options.isPrivate || false,
        password: options.password || "",
        maxUsers: options.maxUsers || 8,
        users: []
      };

      ROOMS[roomID] = room;

      socket.join(roomID);
      socket.currentRoom = roomID;
      ROOMS[roomID].users.push(socket.id);
    } else {
      let msg = "You have to set a name!";
      socket.emit("create_room_error", msg);
    }
  });

  // Joining Room
  socket.on("join_room", data => {
    let room = ROOMS[data.id];

    if (typeof room == "undefined") {
      let msg = "This room doesn't exist";
      socket.emit("join_room_error", msg);
      return false;
    }

    if (room.users.lenght < room.maxUsers) {
      if (room.isPrivate) {
        if (room.password == data.password) {
          socket.join(data.id);
          socket.currentRoom = data.id;
          room.users.push(socket.id);
        } else {
          let msg = "Wrong password";
          socket.emit("join_room_error", msg);
        }
      } else {
        socket.join(data.id);
        socket.currentRoom = data.id;
        room.users.push(socket.id);
      }
    } else {
      let msg = "There is max amount of users.";
      socket.emit("join_room_error", msg);
    }
  });

  // Leaving Room
  socket.on("leave_room", id => {
    if (ROOMS[id].includes(socket.id)) {
      ROOMS[id].users.splice(ROOMS[id].indexOf(socket.id), 1);
      socket.currentRoom = null;
      socket.leave(id);
      if (ROOMS[id].users.lenght == 0) {
        delete ROOMS[id];
      }
    } else {
      let msg = "You are not in this room.";
      socket.emit("leave_room_error", msg);
    }
  });
});

http.listen(5050, () => {
  console.log("Puns.io server is listening on port 5050");
});

process.on("exit", function(code) {
  http.close();
  console.log("Server exit", code);
});
