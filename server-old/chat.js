const createID = require("uniqid");

const SEND_MESSAGE = function(roomID, messageObject) {
  io.to(roomID).emit(
    "receiveMessage",
    Object.assign(messageObject, { id: createID() })
  );
};

const SEND_SERVER_MESSAGE = function(roomID, message) {
  io.to(roomID).emit("receiveServerMessage", message);
};

const SEND_CALLBACK = function (socket, callbackObject) {
  socket.emit("receiveCallback", callbackObject.self);
  socket.broadcast.emit("receiveServerMessage", callbackObject.broadcast);
};

const SEND_CALLBACK_ID = function (socketID, message) {
  io.to(socketID).emit("receiveCallback", message);
};

module.exports = {
  sendMessage: SEND_MESSAGE,
  sendServerMessage: SEND_SERVER_MESSAGE,
  sendCallback: SEND_CALLBACK,
  sendCallbackID: SEND_CALLBACK_ID
};
