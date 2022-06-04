import { genId } from './utils/id'

export const sendMessage = (roomId: string, messagePayload: any) =>
    io.to(roomId).emit('receive_message', { ...messagePayload, id: genId() })

export const sendServerMessage = (roomId: string, message) => io.to(roomId).emit('receive_server_message', message)

export const sendCallback = (socket, callbackObject) => {
    socket.emit('receive_callback', callbackObject.self)
    socket.broadcast.emit('receive_server_message', callbackObject.broadcast)
}

export const sendCallbackId = (socketId: string, message) => io.to(socketId).emit('receive_callback', message)
