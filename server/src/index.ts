import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { ClientToServerEvents, InnerServerEvents, ServerToClientEvents, SocketData } from './services/socket'
import * as ROOMS from './rooms'
import * as CHAT from './chat'

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:8080'
const PORT = process.env.PORT ?? 3000
const app = express()
app.use(cors({ origin: [CLIENT_URL ?? '*', 'https://puns.netlify.app'] }))
app.use(express.json())

const httpServer = createServer(app)

console.log('Client url: ' + CLIENT_URL)

httpServer.listen(PORT, () => {
  console.log(`Backend is running on port: ${PORT}`)
})

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InnerServerEvents, SocketData>(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'puns.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true
})

io.on('connection', socket => {
  // Connect
  console.log(`User connected: ${socket.id}`)
  socket.data.name = socket.id

  // Disconnect
  socket.on('disconnect', () => {
    ROOMS.leaveRoom(socket)
    console.log(`User disconnected: ${socket.id}`)
  })

  // Set socket's name
  socket.on('setName', name => {
    socket.data.name = name
    const room = ROOMS.getSocketRoom(socket)
    if (room) io.to(room.id).emit('receiveUsers', room.getUsers())
  })

  // Creating the room
  socket.on('createRoom', options => ROOMS.createRoom(socket, options))

  // Get Room
  socket.on('getRoom', id => socket.emit('receiveRoom', ROOMS.getRoom(id)))

  // Joining Room
  socket.on('joinRoom', data => {
    if (ROOMS.joinRoom(socket, data.id, data.password)) {
      CHAT.sendServerMessage(data.id, `${socket.data.name} has joined the game!`)
      const room = ROOMS.getRoom(data.id)
      if (!!room?.round) socket.emit('getPainting', ROOMS.getRoom(data.id).round.lineHistory)
    }
  })

  // Leaving Room
  socket.on('leaveRoom', () => ROOMS.leaveRoom(socket))

  // Getting Rooms
  socket.on('getRooms', () => socket.emit('receiveRooms', ROOMS.getRooms()))

  socket.on('sendMessage', msg => {
    const room = ROOMS.getSocketRoom(socket)
    if (room) {
      CHAT.sendMessage(room.id, {
        msg,
        sender: socket.data.name
      })

      if (room.round != null && socket.id != room.painter) {
        // Checking if the message is correct
        if (room.round.check(msg)) {
          ROOMS.givePoints(socket)
          CHAT.sendCallback(socket, {
            self: `Congratulations! You've guessed the word!`,
            broadcast: `${socket.data.name} guessed the word (${room.round.word}) and earned 1 point!`
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
    const room = ROOMS.getSocketRoom(socket)
    if (room?.painter == socket.id && room?.round != null) {
      socket.to(room.id).emit('paint', coords)
      room.round.addLine(coords)
    }
  })

  socket.on('clear', () => {
    const room = ROOMS.getSocketRoom(socket)
    if (room?.painter == socket.id && room?.round != null) {
      room.clearBoard()
    }
  })

  socket.on('wordChosen', word => {
    const room = ROOMS.getSocketRoom(socket)
    if (room?.painter == socket.id && room?.round == null) {
      room.startRound(word)
    }
  })
})
