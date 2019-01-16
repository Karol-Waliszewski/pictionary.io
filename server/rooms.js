const createID = require("uniqid");

var ROOMS = {};

const CREATE_ROOM = function(options) {
  if (typeof options.name == "undefined" || options.name.length == 0) {
    return false;
  }

  let roomID = createID();

  let room = {
    name: options.name,
    isPrivate: options.isPrivate || false,
    password: options.password || "",
    maxUsers: options.maxUsers || 8,
    users: []
  };

  ROOMS[roomID] = room;
  ROOMS.watch(roomID, function(id, oldval, newval) {
    console.log(newval);
  });

  return true;
};

const GET_ROOMS = function() {
  let rooms = [];
  for (let room in ROOMS) {
    rooms.push(Object.assign(ROOMS[room], { id: room }));
  }
  return rooms;
};

const ADD_USER = function(id, password, socket) {
  let room = ROOMS[id];

  if (room.users.lenght == room.maxUsers) {
    return false;
  }

  if (room.isPrivate) {
    if (room.password != password) {
      socket.emit("join_room_error", "Wrong password");
      return false;
    }
  }

  socket.join(id);
  socket.currentRoom = id;
  ROOMS[id].users.push(socket);

  return true;
};

const REMOVE_USER = function(id, user) {
  if (ROOMS[id].includes(user.id)) {
    ROOMS[id].users.splice(ROOMS[id].indexOf(user.id), 1);
    if (ROOMS[id].users.lenght == 0) {
      delete ROOMS[id];
    }
    return true;
  }

  return false;
};
