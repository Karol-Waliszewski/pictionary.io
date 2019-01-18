const createID = require("uniqid");

const SEND_MESSAGE = function(roomID, messageObject) {
  io.to(roomID).emit(
    "receive_message",
    Object.assign(messageObject, { id: createID() })
  );
};

const SEND_CALLBACK = function(socket, callbackObject) {
  socket.emit("receive_callback", callbackObject);
};

module.exports = {
  sendMessage: SEND_MESSAGE,
  sendCallback: SEND_CALLBACK
};
