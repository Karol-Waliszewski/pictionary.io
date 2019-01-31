const ROUND = require('./round');

class ROOM {
    constructor(options) {
        this.name = options.name;
        this.isPrivate = options.isPrivate || false;
        this.password = options.password || "";
        this.maxUsers = options.maxUsers || 8;
        this.users = options.users || [];
        this.points = options.points || {};
        this.names = options.names || {};
        this.painter = null;
        this.created = true;
        this.round = null;
    }

    startRound() {
        this.round = new ROUND('Test');
        this.setPainter();
    }

    stopRound() {
        this.round = null
        this.clearBoard()
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
        // Setting random user a painter
        let newPainter = users[Math.floor(Math.random() * Math.floor(users.length))];
        this.painter = newPainter;

        return newPainter;
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
                name: this.names[user] || user
            });
        }
        return usrs;
    }
}

module.exports = ROOM;