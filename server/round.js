class ROUND {
    constructor(word) {
        this.word = this.simplifyWord(word);
        this.clock = null;
        this.lineHistory = [];
    }

    check(word) {
        return this.word == this.simplifyWord(word);
    }

    isClose(word) {
        if (word.length < 3) {
            return false;
        }
        return this.word.includes(this.simplifyWord(word));
    }

    simplifyWord(word) {
        return word.toLowerCase().replace(/\s/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    addLine(line) {
        this.lineHistory.push(line);
    }

    clearLines() {
        this.lineHistory = [];
    }
}

module.exports = ROUND;