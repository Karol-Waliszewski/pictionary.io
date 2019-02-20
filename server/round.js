class ROUND {
    constructor(word) {
        this.word = word;
        this.clock = null;
        this.lineHistory = [];
    }

    check(word) {
        return this.simplifyWord(this.word) == this.simplifyWord(word);
    }

    isClose(word) {
        if (word.length < 3) {
            return false;
        }
        return this.simplifyWord(this.word).includes(this.simplifyWord(word)) || this.simplifyWord(word).includes(this.simplifyWord(this.word));
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