import axios from 'axios'
import cheerio from 'cheerio'
import { io } from '.'
import * as CHAT from './chat'
import { Round } from './round'
import { TypedSocket } from './services/socket'

export type RoomOptions = {
  id: string
  name: string
  isPrivate?: boolean
  password?: string
  maxUsers?: number
  users?: string[]
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

  painter: string | null
  created: boolean
  round: Round

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
    // const html = await axios.get('http://www.kalambury.org/lib/generate.php')
    // const word = cheerio.load(html.data.trim())('div').text().trim()
    const response = await axios.post<{ serverMemo: { data: { temp_data: string[] } } }>('https://webp.pl/livewire/message/frontend.tools.random-word-generator', {
      fingerprint: { id: 'Z02tICOW0A6mhTa0sfPO', name: 'frontend.tools.random-word-generator', locale: 'pl', path: 'generator-losowych-slow', method: 'GET', v: 'acj' },
      serverMemo: {
        children: [],
        errors: [],
        htmlHash: '7f34eccd',
        data: { word_type: 'nouns', number: '1', data: [], temp_data: ['ruchome piaski'] },
        dataMeta: [],
        checksum: '6ed808b0cac58f72c80bbca6e9b9c9370b4004868a1ab4676fcb8dfbaa79d6a7'
      },
      updates: [{ type: 'callMethod', payload: { id: 'vfeu', method: 'onRandomWordGenerator', params: [] } }]
    })

    const word = response.data.serverMemo.data.temp_data[0]
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

  countDown(time: number) {
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

  startRound(word: string) {
    if (this.users.length > 1) {
      this.round = new Round(word)
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

    let newPainter: string
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

  removeUser({ id, data }: TypedSocket) {
    this.users.splice(this.users.indexOf(id), 1)
    this.queue.splice(this.queue.indexOf(id), 1)

    // If user who left was a painter, replace him.
    if (this.painter == id) {
      this.stopRound()
      CHAT.sendServerMessage(this.id, `Painter (${data.name}) left the game, choosing another painter...`)
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
    return this.users.map(userID => {
      return {
        id: userID,
        points: this.points[userID] || 0,
        name: io.sockets.sockets.get(userID)?.data.name || userID
      }
    })
  }
}
