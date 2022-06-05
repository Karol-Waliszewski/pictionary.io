import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InnerServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./services/socket";
import { get } from "./utils/httpHelpers";

const PORT = 3000;
const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get(
  "/",
  get((_, res) => {
    res.json("Hello, backend!");
  })
);

// app.listen wont work as it creates a new server
httpServer.listen(PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend is running on port: ${PORT}`);
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InnerServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: false,
});

io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => console.log(reason));
  socket.on("userAvailable", (userId) => {
    socket.join(userId);
    socket
      .to(userId)
      .emit(
        "anotherDeviceConnected",
        "Connection to your account was established from another device: " +
          userId
      );
  });
});
