const createID = require("uniqid");
const observe = require("observe");

var ROOMS = observe({});

ROOMS.on("change", function(change) {
  let ID = change.property[0];

  io.emit("receive_rooms", GET_ROOMS());
  io.to(ID).emit("receive_users", ROOMS.subject[ID].users);

  if (ROOMS.subject[ID].users.length == 0) {
    delete ROOMS.subject[ID];
  }
});

const CREATE_ROOM = function(socket, options) {
  if (typeof options.name == "undefined" || options.name.length == 0) {
    let msg = "You have to set a name!";
    socket.emit("create_room_error", msg);
    return false;
  }

  let roomID = createID();

  let room = {
    name: options.name,
    isPrivate: options.isPrivate || false,
    password: options.password || "",
    maxUsers: options.maxUsers || 8,
    users: [socket.id]
  };

  ROOMS.set(roomID, room);

  socket.join(roomID);
  socket.emit("room_created", roomID);
  socket.emit("receive_users", ROOMS.subject[roomID].users);

  return true;
};

const GET_ROOMS = function() {
  let rooms = [];
  for (let room in ROOMS.subject) {
    rooms.push(Object.assign(ROOMS.subject[room], { id: room }));
  }
  return rooms;
};

const GET_ROOM = function(id) {
  return ROOMS.subject[id];
};

const JOIN_ROOM = function(socket, id, password) {
  let room = ROOMS.subject[id];
  let flag = true;

  if (room.users.includes(socket.id)) {
    return false; // You're already in this room;
  }

  if (typeof room == "undefined") {
    var msg = "This room doesn't exist";
    flag = false;
  }

  if (room.users.length == room.maxUsers) {
    var msg = "There is max amount of users.";
    flag = false;
  }

  if (room.isPrivate) {
    if (room.password != password) {
      var msg = "Wrong password";
      flag = false;
    }
  }

  if (!flag) {
    console.error(msg);
    socket.emit("join_room_error", msg);
    return false;
  }

  if (socket.currentRoom != null) {
    LEAVE_ROOM(socket, socket.currentRoom);
  }

  socket.join(id);

  ROOMS.get(`${id}.users`).push(socket.id);

  return true;
};

const LEAVE_ROOM = function(socket) {
  let rooms = GET_ROOMS();

  if (rooms.length == 0) {
    return false;
  }

  for (let room of rooms) {
    for (let user of room.users) {
      if (user == socket.id) {
        ROOMS.get(`${room.id}.users`).splice(
          ROOMS.subject[room.id].users.indexOf(socket.id),
          1
        );
        socket.leave(room.id);
      }
    }
  }

  return true;
};

const LOG_USER = function() {
  return "user";
};

module.exports = {
  createRoom: CREATE_ROOM,
  getRooms: GET_ROOMS,
  getRoom: GET_ROOM,
  joinRoom: JOIN_ROOM,
  leaveRoom: LEAVE_ROOM,
  logUser: LOG_USER
};
