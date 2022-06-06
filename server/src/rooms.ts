import { genId } from './utils/id'
import { io } from './index'

import { Room as ROOM } from './room'

var ROOMS: Record<string, ROOM> = {}

export const createRoom = (socket, options) => {
  if (typeof options.name === 'undefined' || !options.name.length) {
    socket.emit('createRoomError', 'You have to set a name!')
    return false
  }

  leaveRoom(socket)

  const roomId = genId()
  const room = new ROOM({
    id: roomId,
    name: options.name,
    isPrivate: options.isPrivate || false,
    password: options.password || '',
    maxUsers: options.maxUsers || 8,
    roundTime: options.roundTime || 120,
    wordTime: options.wordTime || 25,
    users: [],
    points: {},
    created: true
  })

  ROOMS[roomId] = room
  socket.name = 'Host'
  room.addUser(socket)
  socket.join(roomId)
  socket.emit('room_created', roomId)
  updateRooms()

  room.initRound()

  return true
}

export const getRooms = () => {
  const rooms: ROOM[] = []
  for (let room in ROOMS) {
    rooms.push(
      Object.assign(ROOMS[room], {
        id: room
      })
    )
  }
  return rooms
}

export const updateRooms = () => io.emit('receiveRooms', getRooms())

export const getRoom = (roomId: string) => ROOMS[roomId]

export const joinRoom = (socket, id, password) => {
  let room = ROOMS[id]
  let flag = true

  if (typeof room == 'undefined') {
    socket.emit('joinRoom_error', "This room doesn't exist")
    return false
  }

  if (room.users.includes(socket.id)) {
    return false // You're already in this room;
  }

  if (room.users.length === room.maxUsers) {
    var msg = 'There is max amount of users.'
    flag = false
  }

  if (room.isPrivate) {
    if (room.password != password) {
      var msg = 'Wrong password'
      flag = false
    }
  }

  if (!flag) {
    //console.error(msg);
    socket.emit('joinRoom_error', msg)
    return false
  }

  leaveRoom(socket)
  socket.join(id)
  ROOMS[id].addUser(socket)
  updateRooms()

  return true
}

export const leaveRoom = socket => {
  const rooms = getRooms()
  if (!rooms.length) return false

  for (let room of rooms) {
    for (let user of room.users) {
      if (user == socket.id) {
        const isEmpty = ROOMS[room.id].removeUser(socket)
        if (isEmpty) delete ROOMS[room.id]
        updateRooms()
        socket.leave(room.id)
      }
    }
  }

  return true
}

export const getSocketRoom = socket => {
  console.log(getRooms())
  for (let room of getRooms()) {
    for (let user of room.users) {
      if (user == socket.id) {
        return room
      }
    }
  }

  return null
}

export const givePoints = socket => {
  const room = getSocketRoom(socket)
  if (room) room.givePoints(socket)
}
