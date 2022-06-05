import { Room, RoomOptions } from "src/room";

// use when you send event to the client
export type ServerToClientEvents = {
  anotherDeviceConnected: (message: string) => void
  passWatched: (watchedAssets: string[]) => void
  passPrivacyMode: (privacyMode: boolean) => void
  receiveUsers: (users: any[]) => void;
  receiveRoom: (room: Room) => void;
  receiveRooms: (rooms: Room[]) => void;
  paint: (coords: any) => void;
  roundInitialized: (words: [string, string, string]) => void;
  countdownPainter: (time: number) => void;
  countdown: (time: number) => void;
  roundStarted: () => void;
  receivePassword: (password: string) => void;
  roundStopped: () => void;
  clear: () => void;
  painterChanged: (painter: any) => void;
  getPainting: (lineHistory: any) => void;
  receiveMessage: (message: string) => void;
  receiveServerMessage: (message: string) => void;
  receiveCallback: (message: string) => void;
};

// use when you receive events from a client
export type ClientToServerEvents = {
  init: (message: string) => void
  userAvailable: (userId: string) => void
  updateWatched: (assets: string[], userId: string) => void
  updatePrivacyMode: (privacyStatus: boolean, userId: string) => void
  setName: (name: string) => void;
  createRoom: (options: RoomOptions) => void;
  getRoom: (id: string) => void;
  joinRoom: (room: Room) => void;
  leaveRoom: () => void;
  getRooms: () => void;
  sendMessage: (msg: string) => void;
  paint: (line: string) => void;
  clear: () => void;
  wordChosen: (word: string) => void;
};

// use when you send events between servers
export type InnerServerEvents = {
  localTest: (message: string) => void;
};

// data type that can be passed through events
export type SocketData = {
  data: string;
  name: string;
};
