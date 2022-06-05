import axios from 'axios'
import cheerio from 'cheerio'
import { io } from '.'
import * as CHAT from './chat'
import { ROUND } from './round'

type User = {
  id: string
  points: number
  name: string
}

export type RoomOptions = {
  id: string
  name: string
  isPrivate?: boolean
  password?: string
  maxUsers?: number
  users?: User[]
  roundTime?: number
  wordTime?: number
  points?: Record<string, number>
  created?: boolean
}

export class Room {
  id: RoomOptions['id']
  name: RoomOptions['name']
  isPrivate: RoomOptions['isPrivate']
  password: RoomOptions['password']
  maxUsers: RoomOptions['maxUsers']
  users: RoomOptions['users']
  queue: RoomOptions['users']
  roundTime: RoomOptions['roundTime']
  wordTime: RoomOptions['wordTime']
  points?: RoomOptions['points']

  painter: any
  created: boolean
  round: any

  constructor(options: RoomOptions) {
    this.id = options.id
    this.name = options.name
    this.isPrivate = options.isPrivate || false
    this.password = options.password || ''
    this.maxUsers = options.maxUsers || 8
    this.users = [...options.users] || []
    this.queue = [...options.users] || []
    this.roundTime = options.roundTime || 120
    this.wordTime = options.wordTime || 25
    this.points =
      {
        ...options.points
      } || {}
    this.painter = null
    this.created = true
    this.round = null
  }

  async getWord() {
    const html = await axios.get('http://www.kalambury.org/lib/generate.php')
    const word = cheerio.load(html.data.trim())('div').text().trim()
    return word
  }

  async initRound() {
    const words = await Promise.all([this.getWord(), this.getWord(), this.getWord()])

    this.setPainter()
    io.to(this.painter).emit('roundInitialized', words)

    let time = this.wordTime
    io.to(this.id).emit('countdownPainter', time)
    const interval = setInterval(() => {
      if (this.users.length > 1) {
        if (time <= 0) {
          CHAT.sendServerMessage(this.id, `Painter didn't chose the word, skipping the round.`)
          this.initRound()
          clearInterval(interval)
        } else if (this.round != null) {
          clearInterval(interval)
        }
        time--
        if (time >= 0) io.to(this.id).emit('countdownPainter', time)
      }
    }, 1000)
  }

  countDown(time) {
    io.to(this.id).emit('countdown', time)
    const interval = setInterval(() => {
      if (time <= 0) {
        CHAT.sendServerMessage(this.id, `No one guessed the word. The word was: ${this.round.word}`)
        this.stopRound()
        clearInterval(interval)
      } else if (this.round == null) {
        clearInterval(interval)
      } else {
        time--
        io.to(this.id).emit('countdown', time)
      }
    }, 1000)
  }

  startRound(word) {
    if (this.users.length > 1) {
      this.round = new ROUND(word)
      io.to(this.id).emit('roundStarted')
      io.to(this.painter).emit('receivePassword', word)
      CHAT.sendServerMessage(this.id, `Round started!`)
      CHAT.sendCallbackId(this.painter, `The secret word is: ${word}`)
      this.countDown(this.roundTime)
    } else {
      CHAT.sendCallbackId(this.painter, `You need at least 2 players to start the game!`)
    }
  }

  stopRound() {
    this.round = null
    this.clearBoard()
    io.to(this.id).emit('roundStopped')
    CHAT.sendServerMessage(this.id, `Round finished!`)
    io.to(this.id).emit('countdown', 0)

    // Restart
    this.initRound()
  }

  clearBoard() {
    if (this.round != null) this.round.clearLines()
    io.to(this.id).emit('clear')
  }

  setPainter() {
    if (!this.users.length) return false

    let newPainter
    do {
      newPainter = this.queue.pop()
      this.queue.unshift(newPainter)
    } while (this.painter == newPainter)
    this.painter = newPainter

    io.to(this.id).emit('painterChanged', newPainter)
    CHAT.sendCallbackId(this.painter, 'You are a new painter!')

    return true
  }

  getPainter() {
    for (let user of this.users) {
      if (user == this.painter) {
        return user
      }
    }
    return false
  }

  addUser({ id }) {
    this.users.push(id)
    this.points[id] = 0
    this.queue.unshift(id)
    this.updateUsers()
  }

  removeUser({ id, name }) {
    this.users.splice(this.users.indexOf(id), 1)
    this.queue.splice(this.queue.indexOf(id), 1)

    // If user who left was a painter, replace him.
    if (this.painter == id) {
      this.stopRound()
      CHAT.sendServerMessage(this.id, `Painter (${name}) left the game, choosing another painter...`)
    }

    this.updateUsers()

    // Return if room is empty
    return this.users.length === 0
  }

  givePoints({ id }, points = 1) {
    this.points[id] += points
    this.updateUsers()
  }

  updateUsers() {
    io.to(this.id).emit('receiveUsers', this.getUsers())
  }

  getUsers() {
    return this.users.map((user: any) => {
      console.log(io.sockets.sockets[user]?.name, 'name')
      return {
        id: user as string,
        points: this.points[user] || 0,
        name: io.sockets.sockets[user]?.name || user
      }
    })
  }
}
