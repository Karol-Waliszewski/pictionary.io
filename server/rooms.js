const createID = require("uniqid");
const observe = require("observe");

var ROOMS = {};

var observer = observe(ROOMS);

observer.on("change", function() {
  console.log(ROOMS);
});

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

  return roomID;
};

const GET_ROOMS = function() {
  let rooms = [];
  for (let room in ROOMS) {
    rooms.push(Object.assign(ROOMS[room], { id: room }));
  }
  return rooms;
};

const ADD_USER = function(id, socket, password) {
  let room = ROOMS[id];

  if (typeof room == "undefined") {
    return false;
  }

  if (room.users.lenght == room.maxUsers) {
    return false;
  }

  if (room.isPrivate) {
    if (room.password != password) {
      return false;
    }
  }

  ROOMS[id].users.push(socket);

  return true;
};

const REMOVE_USER = function(id, user) {
  if (ROOMS[id].includes(user)) {
    ROOMS[id].users.splice(ROOMS[id].indexOf(user), 1);
    if (ROOMS[id].users.lenght == 0) {
      delete ROOMS[id];
    }
    return true;
  }

  return false;
};

module.exports = {
  createRoom: CREATE_ROOM,
  getRooms: GET_ROOMS,
  addUser: ADD_USER,
  removeUser: REMOVE_USER
};
