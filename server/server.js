const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", socket => {
  // Connect
  console.log(`User connected: ${socket.id}`);

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Hello
  socket.on("hello", msg => {
    console.log(`Hello: ${socket.id}, ${msg}`);
    io.emit("hello", msg);
  });
});

http.listen(5050, () => {
  console.log("Puns.io server is listening on port 5050");
});

process.on("exit", function(code) {
  http.close();
  console.log("Server exit", code);
});
