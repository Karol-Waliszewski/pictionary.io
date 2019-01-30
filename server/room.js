const ROUND = require('./round');

class ROOM {
    constructor(options) {
        this.name = options.name;
        this.isPrivate = options.isPrivate || false;
        this.password = options.password || "";
        this.maxUsers = options.maxUsers || 8;
        this.users = options.users || [];
        this.painter = null;
        this.created = true;
        this.round = null;
    }

    startRound() {
        this.round = new Round('Test');
        this.round.start();

    }

    stopRound() {
        this.round.stop();
    }

    setPainter() {
        // Getting users except current painter
        let users = this.users.filter(user => user != this.painter);
        // Setting random user a painter
        let newPainter = users[Math.floor(Math.random() * Math.floor(users.length))];
        this.painter = newPainter;

        return newPainter;
    }

    givePoints() {

    }
}

module.exports = ROOM;