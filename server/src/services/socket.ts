import { Socket } from 'socket.io';
import { Room, RoomOptions } from 'src/room'
import { Line } from 'src/round'

export type Message = { msg: string; sender: string }

// events sent to the client
export type ServerToClientEvents = {
  receiveUsers: (users: any[]) => void
  receiveRoom: (room: Room) => void
  receiveRooms: (rooms: Room[]) => void
  paint: (coords: any) => void
  roundInitialized: (words: [string, string, string]) => void
  countdownPainter: (time: number) => void
  countdown: (time: number) => void
  roundStarted: () => void
  receivePassword: (password: string) => void
  roundStopped: () => void
  clear: () => void
  painterChanged: (painter: any) => void
  getPainting: (lineHistory: any) => void
  receiveMessage: (message: Message & { id: string }) => void
  receiveServerMessage: (message: string) => void
  receiveCallback: (message: string) => void
  anotherDeviceConnected: (message: string) => void
  createRoomError: (message: string) => void
  joinRoomError: (message: string) => void
  roomCreated: (id: string) => void
}

// events received from a client
export type ClientToServerEvents = {
  setName: (name: string) => void
  createRoom: (options: RoomOptions) => void
  getRoom: (id: string) => void
  joinRoom: (room: Room) => void
  leaveRoom: () => void
  getRooms: () => void
  sendMessage: (msg: string) => void
  paint: (line: Line) => void
  clear: () => void
  wordChosen: (word: string) => void
}

// events sent between servers
export type InnerServerEvents = {
  localTest: (message: string) => void
}

// data type that can be passed through event
export type SocketData = {
  name: string
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InnerServerEvents, SocketData>
