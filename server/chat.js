const createID = require("uniqid");

const SEND_MESSAGE = function(roomID, messageObject) {
  io.to(roomID).emit(
    "receive_message",
    Object.assign(messageObject, { id: createID() })
  );
};

const SEND_SERVER_MESSAGE = function(roomID, message) {
  io.to(roomID).emit("receive_server_message", message);
};

const SEND_CALLBACK = function (socket, callbackObject) {
  socket.emit("receive_callback", callbackObject.self);
  socket.broadcast.emit("receive_server_message", callbackObject.self);
};

module.exports = {
  sendMessage: SEND_MESSAGE,
  sendServerMessage: SEND_SERVER_MESSAGE,
  sendCallback: SEND_CALLBACK
};
