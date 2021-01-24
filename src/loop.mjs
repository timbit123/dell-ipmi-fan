class Loop {
  config = {}
  isLooping = false
  /** @var {Ipmi} */
  ipmi

  /**
   *
   * @param {object} config
   * @param {Ipmi} ipmi
   */
  constructor (config, ipmi) {
    this.config = config
    this.ipmi = ipmi
  }

  startLoop () {
    this.isLooping = true
    this.loop()
  }

  async loop () {
    if (!this.isLooping) {
      return
    }
    await this.ipmi.updateFan()
    setTimeout(() => this.loop(), this.config.looptime)
  }

  stopLoop () {
    this.isLooping = false
  }
}

export default Loop
