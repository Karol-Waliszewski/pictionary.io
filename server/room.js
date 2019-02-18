const axios = require("axios");
const cheerio = require('cheerio')
const ROUND = require('./round');

class ROOM {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.isPrivate = options.isPrivate || false;
        this.password = options.password || "";
        this.maxUsers = options.maxUsers || 8;
        this.users = options.users || [];
        this.points = options.points || {};
        this.painter = null;
        this.created = true;
        this.round = null;
    }

    async getWord() {
        let word = await axios.get('http://www.kalambury.org/lib/generate.php?fbclid=IwAR0jEZum7uQ8tSN8ZzpMt3c1ZXwe5KJYYuJRiay2sqyTfx_3pnjyEKAxDL4');
        word = cheerio.load(word.data.trim()).text();
        return word;
    }

    async initRound() {
        let words = [await this.getWord(), await this.getWord(), await this.getWord()];
        this.setPainter();
        io.to(this.painter).emit("round_initialized", words);

        let time = 20;
        io.to(this.id).emit('countdown_painter', time);
        let interval = setInterval(() => {
            if (this.users.length > 1) {
                if (time <= 0) {
                    this.startRound(words[Math.floor(Math.random() * (words.length - 1))]);
                    clearInterval(interval);
                } else if (this.round != null) {
                    clearInterval(interval);
                }
                time--;
                io.to(this.id).emit('countdown_painter', time);
            }
        }, 1000);
    }

    countDown(time) {
        io.to(this.id).emit('countdown', time);
        let interval = setInterval(() => {
            if (time <= 0) {
                this.stopRound();
                CHAT.sendServerMessage(this.id, `No one guessed the word.`);
                clearInterval(interval);
            } else if (this.round == null) {
                clearInterval(interval);
            } else {
                time--;
                io.to(this.id).emit('countdown', time);
            }
        }, 1000);

    }

    startRound(word) {
        if (this.users.length > 1) {
            this.round = new ROUND(word);
            io.to(this.id).emit("round_started");
            CHAT.sendServerMessage(this.id, `Round started!`);
            CHAT.sendCallbackID(this.painter, `The secret word is: ${word}`);
            this.countDown(120);
        } else {
            CHAT.sendCallbackID(this.painter, `You need at least 2 players to start the game!`);
        }
    }

    stopRound() {
        this.round = null;
        this.clearBoard();
        io.to(this.id).emit("round_stopped");
        CHAT.sendServerMessage(this.id, `Round finished!`);
        io.to(this.id).emit('countdown', 0);

        // Restart
        this.initRound();
    }

    clearBoard() {
        if (this.round != null) {
            this.round.clearLines();
        }
        io.to(this.id).emit('clear');
    }

    setPainter() {
        // Getting users except current painter
        let users = this.users.filter(user => user != this.painter);

        if (users.length == 0) return false;

        // Setting random user a painter
        let newPainter = users[Math.floor(Math.random() * Math.floor(users.length))];
        this.painter = newPainter;

        io.to(this.id).emit("painter_changed", newPainter);
        CHAT.sendCallbackID(this.painter, 'You are a new painter!');

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

    getUsers() {
        let usrs = [];
        for (let user of this.users) {
            usrs.push({
                id: user,
                points: this.points[user] || 0,
                name: io.sockets.sockets[user].name || user
            });
        }
        return usrs;
    }
}

module.exports = ROOM;