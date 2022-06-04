const createID = require("uniqid");
const ROOM = require("./room");

var ROOMS = {};

const CREATE_ROOM = function (socket, options) {
  if (typeof options.name == "undefined" || options.name.length == 0) {
    let msg = "You have to set a name!";
    socket.emit("create_room_error", msg);
    return false;
  }

  LEAVE_ROOM(socket);

  let roomID = createID();

  let room = new ROOM({
    id: roomID,
    name: options.name,
    isPrivate: options.isPrivate || false,
    password: options.password || "",
    maxUsers: options.maxUsers || 8,
    roundTime: options.roundTime || 120,
    wordTime: options.wordTime || 25,
    users: [],
    points: {},
    created: true,
  });

  ROOMS[roomID] = room;
  socket.name = "Host";
  room.addUser(socket);
  socket.join(roomID);
  socket.emit("room_created", roomID);
  UPDATE_ROOMS();

  room.initRound();

  return true;
};

const GET_ROOMS = function () {
  let rooms = [];
  for (let room in ROOMS) {
    rooms.push(
      Object.assign(ROOMS[room], {
        id: room,
      })
    );
  }
  return rooms;
};

const UPDATE_ROOMS = function () {
  io.emit("receive_rooms", GET_ROOMS());
};

const GET_ROOM = function (id) {
  return ROOMS[id];
};

const JOIN_ROOM = function (socket, id, password) {
  let room = ROOMS[id];
  let flag = true;

  if (typeof room == "undefined") {
    socket.emit("join_room_error", "This room doesn't exist");
    return false;
  }

  if (room.users.includes(socket.id)) {
    return false; // You're already in this room;
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
    //console.error(msg);
    socket.emit("join_room_error", msg);
    return false;
  }

  LEAVE_ROOM(socket);
  socket.join(id);
  ROOMS[id].addUser(socket);
  UPDATE_ROOMS();

  return true;
};

const LEAVE_ROOM = function (socket) {
  let rooms = GET_ROOMS();

  if (rooms.length == 0) {
    return false;
  }

  for (let room of rooms) {
    for (let user of room.users) {
      if (user == socket.id) {
        let isEmpty = ROOMS[room.id].removeUser(socket);
        if (isEmpty) {
          delete ROOMS[room.id];
        }
        UPDATE_ROOMS();
        socket.leave(room.id);
      }
    }
  }

  return true;
};

const GET_SOCKET_ROOM = function (socket) {
  for (let room of GET_ROOMS()) {
    for (let user of room.users) {
      if (user == socket.id) {
        return room;
      }
    }
  }

  return false;
};

const GIVE_POINTS = function (socket) {
  let room = GET_SOCKET_ROOM(socket);
  if (room) {
    room.givePoints(socket);
  }
};

module.exports = {
  createRoom: CREATE_ROOM,
  getRooms: GET_ROOMS,
  getRoom: GET_ROOM,
  joinRoom: JOIN_ROOM,
  leaveRoom: LEAVE_ROOM,
  getSocketRoom: GET_SOCKET_ROOM,
  givePoints: GIVE_POINTS,
};
