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
  socket.broadcast.emit("receive_server_message", callbackObject.broadcast);
};

const SEND_CALLBACK_ID = function (socketID, message) {
  io.to(socketID).emit("receive_callback", message);
};

module.exports = {
  sendMessage: SEND_MESSAGE,
  sendServerMessage: SEND_SERVER_MESSAGE,
  sendCallback: SEND_CALLBACK,
  sendCallbackID: SEND_CALLBACK_ID
};
