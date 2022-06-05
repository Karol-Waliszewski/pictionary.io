import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { ClientToServerEvents, InnerServerEvents, ServerToClientEvents, SocketData } from './services/socket'

const CLIENT_URL = 'http://localhost:8080'
const PORT = 3000
const app = express()
const httpServer = createServer(app)

app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/', (_, res) => {
  res.json('Hello, backend!')
})

// app.listen wont work as it creates a new server
httpServer.listen(PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend is running on port: ${PORT}`)
})

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InnerServerEvents, SocketData>(httpServer, {
  cors: {
    origin: [CLIENT_URL || '*'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true
})

type ExtendedSocket = Socket & {
  name: string
}

const ROOMS = require('./rooms')
const CHAT = require('./chat')

io.on('connection', socket => {
  // Connect
  console.log(`User connected: ${socket.id}`)
  ;(socket as ExtendedSocket).name = socket.id

  // Disconnect
  socket.on('disconnect', () => {
    ROOMS.leaveRoom(socket)
    console.log(`User disconnected: ${socket.id}`)
  })

  // Set socket's name
  socket.on('setName', name => {
    ;(socket as ExtendedSocket).name = name
    let room = ROOMS.getSocketRoom(socket)
    if (room) io.to(room.id).emit('receiveUsers', room.getUsers())
  })

  // Creating the room
  socket.on('createRoom', options => {
    ROOMS.createRoom(socket, options)
  })

  // Get Room
  socket.on('getRoom', id => {
    socket.emit('receiveRoom', ROOMS.getRoom(id))
  })

  // Joining Room
  socket.on('joinRoom', data => {
    if (ROOMS.joinRoom(socket, data.id, data.password)) {
      CHAT.sendServerMessage(data.id, `${(socket as ExtendedSocket).name} has joined the game!`)
      let room = ROOMS.getRoom(data.id)
      if (room.round != null) {
        socket.emit('getPainting', ROOMS.getRoom(data.id).round.lineHistory)
      }
    }
  })

  // Leaving Room
  socket.on('leaveRoom', () => {
    ROOMS.leaveRoom(socket)
  })

  // Getting Rooms
  socket.on('getRooms', () => {
    socket.emit('receiveRooms', ROOMS.getRooms())
  })

  socket.on('sendMessage', msg => {
    let room = ROOMS.getSocketRoom(socket)
    if (room) {
      CHAT.sendMessage(room.id, {
        msg,
        sender: (socket as ExtendedSocket).name
      })

      if (room.round != null && socket.id != room.painter) {
        // Checking if the message is correct
        if (room.round.check(msg)) {
          ROOMS.givePoints(socket)
          CHAT.sendCallback(socket, {
            self: `Congratulations! You've guessed the word!`,
            broadcast: `${(socket as ExtendedSocket).name} guessed the word (${room.round.word}) and earned 1 point!`
          })
          room.stopRound()
        } else {
          if (room.round.isClose(msg)) {
            CHAT.sendCallback(socket, {
              self: `You're so close!`
            })
          }
        }
      }
    }
  })

  socket.on('paint', coords => {
    let room = ROOMS.getSocketRoom(socket)
    if (room.painter == socket.id && room.round != null) {
      socket.to(room.id).emit('paint', coords)
      room.round.addLine(coords)
    }
  })

  socket.on('clear', () => {
    let room = ROOMS.getSocketRoom(socket)
    if (room.painter == socket.id && room.round != null) {
      room.clearBoard()
    }
  })

  socket.on('wordChosen', word => {
    let room = ROOMS.getSocketRoom(socket)
    if (room.painter == socket.id && room.round == null) {
      room.startRound(word)
    }
  })
})
