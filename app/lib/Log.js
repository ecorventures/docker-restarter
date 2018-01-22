class Log {
  constructor () {
    this.logcontent = []
  }

  toString() {
    return this.logcontent.join('\n')
  }

  get html () {
    return this.toString().replace(/\n/gi, '<br/>')
  }

  print (msg) {
    if (msg instanceof Error) {
      this.logcontent.push(msg.message)
      console.error(msg)
    } else {
      this.logcontent.push(msg)
      console.log(msg)
    }
  }
}

module.exports = Log
