const axios = require("axios");
const cheerio = require("cheerio");
const ROUND = require("./round");

class ROOM {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.isPrivate = options.isPrivate || false;
    this.password = options.password || "";
    this.maxUsers = options.maxUsers || 8;
    this.users = [...options.users] || [];
    this.queue = [...options.users] || [];
    this.roundTime = options.roundTime || 120;
    this.wordTime = options.wordTime || 25;
    this.points =
      {
        ...options.points,
      } || {};
    this.painter = null;
    this.created = true;
    this.round = null;
  }

  async getWord() {
    let word = await axios.get(
      "http://www.kalambury.org/lib/generate.php?fbclid=IwAR0jEZum7uQ8tSN8ZzpMt3c1ZXwe5KJYYuJRiay2sqyTfx_3pnjyEKAxDL4"
    );
    word = cheerio.load(word.data.trim()).text();
    return word;
  }

  async initRound() {
    let words = [
      await this.getWord(),
      await this.getWord(),
      await this.getWord(),
    ];
    this.setPainter();
    io.to(this.painter).emit("roundInitialized", words);

    let time = this.wordTime;
    io.to(this.id).emit("countdownPainter", time);
    let interval = setInterval(() => {
      if (this.users.length > 1) {
        if (time <= 0) {
          CHAT.sendServerMessage(
            this.id,
            `Painter didn't chose the word, skipping the round.`
          );
          this.initRound();
          clearInterval(interval);
        } else if (this.round != null) {
          clearInterval(interval);
        }
        time--;
        if (time >= 0) io.to(this.id).emit("countdownPainter", time);
      }
    }, 1000);
  }

  countDown(time) {
    io.to(this.id).emit("countdown", time);
    let interval = setInterval(() => {
      if (time <= 0) {
        CHAT.sendServerMessage(
          this.id,
          `No one guessed the word. The word was: ${this.round.word}`
        );
        this.stopRound();
        clearInterval(interval);
      } else if (this.round == null) {
        clearInterval(interval);
      } else {
        time--;
        io.to(this.id).emit("countdown", time);
      }
    }, 1000);
  }

  startRound(word) {
    if (this.users.length > 1) {
      this.round = new ROUND(word);
      io.to(this.id).emit("roundStarted");
      io.to(this.painter).emit("receivePassword", word);
      CHAT.sendServerMessage(this.id, `Round started!`);
      CHAT.sendCallbackID(this.painter, `The secret word is: ${word}`);
      this.countDown(this.roundTime);
    } else {
      CHAT.sendCallbackID(
        this.painter,
        `You need at least 2 players to start the game!`
      );
    }
  }

  stopRound() {
    this.round = null;
    this.clearBoard();
    io.to(this.id).emit("roundStopped");
    CHAT.sendServerMessage(this.id, `Round finished!`);
    io.to(this.id).emit("countdown", 0);

    // Restart
    this.initRound();
  }

  clearBoard() {
    if (this.round != null) {
      this.round.clearLines();
    }
    io.to(this.id).emit("clear");
  }

  setPainter() {
    if (this.users.length == 0) return false;

    let newPainter;
    do {
      newPainter = this.queue.pop();
      this.queue.unshift(newPainter);
    } while (this.painter == newPainter);
    this.painter = newPainter;

    io.to(this.id).emit("painterChanged", newPainter);
    CHAT.sendCallbackID(this.painter, "You are a new painter!");

    return true;
  }

  getPainter() {
    for (let user of this.users) {
      if (user == this.painter) {
        return user;
      }
    }
    return false;
  }

  addUser({ id }) {
    this.users.push(id);
    this.points[id] = 0;
    this.queue.unshift(id);
    this.updateUsers();
  }

  removeUser({ id, name }) {
    this.users.splice(this.users.indexOf(id), 1);
    this.queue.splice(this.queue.indexOf(id), 1);

    // If user who left was a painter, replace him.
    if (this.painter == id) {
      this.stopRound();
      CHAT.sendServerMessage(
        this.id,
        `Painter (${name}) left the game, choosing another painter...`
      );
    }

    this.updateUsers();

    // Return if room is empty
    return this.users.length == 0 ? true : false;
  }

  givePoints({ id }, points = 1) {
    this.points[id] += points;
    this.updateUsers();
  }

  updateUsers() {
    io.to(this.id).emit("receiveUsers", this.getUsers());
  }

  getUsers() {
    let usrs = [];
    for (let user of this.users) {
      usrs.push({
        id: user,
        points: this.points[user] || 0,
        name: io.sockets.sockets[user].name || user,
      });
    }
    return usrs;
  }
}

module.exports = ROOM;
