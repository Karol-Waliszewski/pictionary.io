const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const observe = require("observe");

const createID = require("uniqid");

var ROOMS = {};

var getRooms = function() {
  let rooms = [];
  for (let room in ROOMS) {
    rooms.push(Object.assign(ROOMS[room], { id: room }));
  }
  return rooms;
};

var observer = observe(ROOMS);

observer.on("change", function(change) {
  console.log(ROOMS);
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", socket => {
  // Connect
  console.log(`User connected: ${socket.id}`);

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.currentRoom != null) {
      ROOMS[socket.currentRoom].users.splice(
        ROOMS[socket.currentRoom].users.indexOf(socket.id),
        1
      );
      io.to(socket.currentRoom).emit("receive_users", ROOMS[socket.currentRoom].users);
    }
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
    if (typeof options.name != "undefined" && options.name.length >= 0) {
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
      //ROOMS[roomID].users.push(socket.id);
      io.emit("receive_rooms", getRooms());
      socket.emit("room_created", roomID);
    } else {
      let msg = "You have to set a name!";
      socket.emit("create_room_error", msg);
    }

    console.log(ROOMS);
  });

  // Joining Room
  socket.on("join_room", data => {
    let room = ROOMS[data.id];

    if (typeof room == "undefined") {
      let msg = "This room doesn't exist";
      socket.emit("join_room_error", msg);
      return false;
    }

    if (room.users.lenght == room.maxUsers) {
      let msg = "There is max amount of users.";
      socket.emit("join_room_error", msg);
      return false;
    }

    if (room.isPrivate) {
      if (room.password != data.password) {
        let msg = "Wrong password";
        socket.emit("join_room_error", msg);
        return false;
      }
    }

    socket.join(data.id);
    socket.currentRoom = data.id;
    room.users.push(socket.id);

    io.to(room.id).emit("receive_users", ROOMS[room.id].users);
  });

  // Leaving Room
  socket.on("leave_room", () => {
    id = socket.currentRoom;

    if (id == null) {
      return false;
    }

    if (ROOMS[id].users.includes(socket.id)) {
      ROOMS[id].users.splice(ROOMS[id].users.indexOf(socket.id), 1);
      socket.currentRoom = null;
      socket.leave(id);
      io.to(id).emit("receive_users", ROOMS[id].users);
      if (ROOMS[id].users.length == 0) {
        delete ROOMS[id];
        io.emit("receive_rooms", getRooms());
      }
    } else {
      let msg = "You are not in this room.";
      socket.emit("leave_room_error", msg);
    }
  });

  // Getting Rooms
  socket.on("get_rooms", id => {
    socket.emit("receive_rooms", getRooms());
  });

  // Getting Users
  socket.on("get_users", () => {
    if (socket.currentRoom != null) {
      socket.emit("receive_users", ROOMS[socket.currentRoom].users);
    } else {
      let msg = "You are in any room";
      socket.emit("receive_users_error", msg);
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
