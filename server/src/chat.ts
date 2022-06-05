import { Socket } from 'socket.io'
import { genId } from './utils/id'

export const sendMessage = (roomId: string, messagePayload: any) =>
    io.to(roomId).emit('receiveMessage', { ...messagePayload, id: genId() })

export const sendServerMessage = (roomId: string, message: string) => io.to(roomId).emit('receiveServerMessage', message)

export const sendCallback = (socket: Socket, callbackObject) => {
    socket.emit('receiveCallback', callbackObject.self)
    socket.broadcast.emit('receiveServerMessage', callbackObject.broadcast)
}

export const sendCallbackId = (socketId: string, message: string) => io.to(socketId).emit('receiveCallback', message)
