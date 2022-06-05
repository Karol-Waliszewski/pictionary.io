import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InnerServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./services/socket";

declare global {
  var io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InnerServerEvents,
    SocketData
  >;
  var CHAT: any;
}
export {};
