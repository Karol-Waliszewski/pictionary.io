const createID = require("uniqid");
const observe = require("observe");
const ROOM = require('./room');

var ROOMS = observe({});

ROOMS.on("change", function (change) {
  let ID = change.property[0];

  io.to(ID).emit("receive_users", ROOMS.subject[ID].getUsers());

  console.log(ROOMS.subject[ID])

  if (ROOMS.subject[ID].users.length == 0) {
    if ("created" in ROOMS.subject[ID]) {
      delete ROOMS.subject[ID].created;
    } else {
      delete ROOMS.subject[ID];
    }
  }

  io.emit("receive_rooms", GET_ROOMS());
});

const CREATE_ROOM = function (socket, options) {
  if (typeof options.name == "undefined" || options.name.length == 0) {
    let msg = "You have to set a name!";
    socket.emit("create_room_error", msg);
    return false;
  }

  LEAVE_ROOM(socket);

  let roomID = createID();
  let pts = {};
  pts[socket.id] = 0;

  let nms = {};
  nms[socket.id] = socket.name

  let room = new ROOM({
    id: roomID,
    name: options.name,
    isPrivate: options.isPrivate || false,
    password: options.password || "",
    maxUsers: options.maxUsers || 8,
    users: [socket.id],
    names: nms,
    points: pts,
    created: true
  })

  ROOMS.set(roomID, room);
  socket.join(roomID);
  socket.emit("room_created", roomID);

  room.startRound();

  setTimeout(() => {
    socket.emit("receive_users", room.getUsers());
  }, 100);

  setTimeout(() => {
    delete ROOMS.subject[roomID].created;
  }, 150);

  return true;
};

const GET_ROOMS = function () {
  let rooms = [];
  for (let room in ROOMS.subject) {
    rooms.push(Object.assign(ROOMS.subject[room], {
      id: room
    }));
  }
  return rooms;
};

const GET_ROOM = function (id) {
  return ROOMS.subject[id];
};

const JOIN_ROOM = function (socket, id, password) {
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

  LEAVE_ROOM(socket);
  socket.join(id);
  ROOMS.get(`${id}.users`).push(socket.id);
  ROOMS.set(`${id}.names.${socket.id}`, socket.name);
  ROOMS.set(`${id}.points.${socket.id}`, 0);

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
  ROOMS.set(`${room.id}.points.${socket.id}`, ROOMS.subject[room.id].points[socket.id] + 1);
}

module.exports = {
  createRoom: CREATE_ROOM,
  getRooms: GET_ROOMS,
  getRoom: GET_ROOM,
  joinRoom: JOIN_ROOM,
  leaveRoom: LEAVE_ROOM,
  getSocketRoom: GET_SOCKET_ROOM,
  givePoints: GIVE_POINTS
};