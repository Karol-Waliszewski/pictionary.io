class ROUND {
    constructor(word) {
        this.word = word.toLowerCase();
        this.clock = null;
        this.lineHistory = [];
    }

    check(word){
        return this.word == word.toLowerCase();
    }

    addLine(line){
        this.lineHistory.push(line);
    }

    clearLines(){
        this.lineHistory = [];
    }
}

module.exports = ROUND;