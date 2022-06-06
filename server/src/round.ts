type Pos = { x: number; y: number }
export type Line = {
  color: string
  coords: {
    prevPos: Pos
    currPos: Pos
  }
}

export class Round {
  word: string
  simplified: string[]
  clock: number
  lineHistory: Line[]

  constructor(word: string) {
    this.word = word
    this.simplified = this.splitWord(this.simplifyWord(word))
    this.clock = null
    this.lineHistory = []
  }

  check(word: string) {
    let prompted = this.splitWord(this.simplifyWord(word))
    if (this.simplified.length != prompted.length) return false

    let flag = true

    for (let w of prompted) {
      if (!this.simplified.includes(w)) {
        flag = false
      }
    }

    return flag
  }

  isClose(word: string) {
    if (word.length < 3) return false
    const prompted = this.splitWord(this.simplifyWord(word))
    let counter = 0

    for (let p of prompted) {
      for (let w of this.simplified) {
        if (w.includes(p) && w.length > 3 && p.length > 3) {
          counter++
        }
      }
    }

    return counter >= this.simplified.length / 2.5
  }

  simplifyWord(word: string) {
    return word
      .toLowerCase()
      .replace(/\s{2,}/g, ' ')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  splitWord(word: string) {
    return word.split(' ').filter(el => el.length)
  }

  addLine(line: Line) {
    this.lineHistory.push(line)
  }

  clearLines() {
    this.lineHistory = []
  }
}
