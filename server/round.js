class ROUND {
    constructor(word) {
        this.word = word.toLowerCase();
        this.clock = null;
    }

    start() {
        this.clock = setTimeout(this.stopRound, 1000 * 60 * 2); // 2 Min round time
    }

    stop(){
        clearTimeout(this.clock);
    }

    check(word){
        return this.word == word.toLowerCase();
    }
}

module.exports = ROUND;