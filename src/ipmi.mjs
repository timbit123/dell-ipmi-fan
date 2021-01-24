import { spawn } from './spawn.mjs'
import { decToHex } from 'hex2dec'

class Ipmi {
  /** @var {Config} */
  config
  dynamicFanControlActivated = false
  lastPercentage

  /**
   *
   * @param {Config} config
   */
  constructor (config) {
    this.config = config
  }

  /**
   * Get the current temperature and update fan speed if required
   * @returns {Promise<void>}
   */
  async updateFan () {
    const temp = await this.readTemps()
    const percentage = this._calculatePercentage(temp)

    // If same percentage don't update
    if (percentage !== this.lastPercentage) {
      this.lastPercentage = percentage
      await this.setFanSpeed(percentage)
    }
  }

  /**
   * Fetch IPMI temperature using pointer from configuration (temp probe name)
   * @returns {Promise<number>} temperature
   */
  async readTemps () {
    const args = this._generateLogin()
    args.push('sdr', 'type', 'temp')
    const result = await spawn(this.config.ipmitoolBinPath, args)
    const line = result
      .split('\n')
      .filter(line => line.indexOf(this.config.temp.pointer) !== -1)
    if (!line.length) {
      throw new Error(`Temperature not found, please update pointer setting from this list\n${result}`)
    }
    const temp = this._findTemperature(line[0])
    console.log(`Current temperature for ${this.config.temp.pointer} : ${temp} C`)
    return temp
  }

  /**
   * Activate or Deactivate dynamic fan control
   * @param {boolean} activate
   * @returns {Promise<void>}
   */
  async dynamicFanControl (activate = false) {
    const args = [...this._generateLogin(), 'raw', '0x30', '0x30', '0x01']
    if (activate) {
      args.push('0x01')
    } else {
      args.push('0x00')
    }
    const result = await spawn(this.config.ipmitoolBinPath, args)
    this.dynamicFanControlActivated = activate
    console.log(result)
  }

  /**
   * Convert percentage to hex and send the value to IPMI
   * @param {number} percentage
   * @returns {Promise<void>}
   */
  async setFanSpeed (percentage) {
    if (this.dynamicFanControlActivated) {
      await this.dynamicFanControl(false)
    }
    const args = [...this._generateLogin(), 'raw', '0x30', '0x30', '0x02', '0xff']
    args.push(decToHex(percentage.toString()))
    console.log(`Setting fan to ${percentage}%`)
    await spawn(this.config.ipmitoolBinPath, args)
  }

  /**
   *
   * @param {number} deg
   * @returns {number} percentage
   * @private
   */
  _calculatePercentage (deg) {
    const { min: fanMin, max: fanMax } = this.config.fan
    const { min: tempMin, max: tempMax } = this.config.temp
    const deltaTemp = tempMax - tempMin
    const deltaFan = fanMax - fanMin
    const steps = deltaFan / deltaTemp
    if (deg < tempMin) {
      return fanMin
    } else if (deg > tempMax) {
      return fanMax
    } else {
      return Math.ceil((deg - tempMin) * steps + fanMin)
    }
  }

  /**
   *
   * @returns {array}
   * @private
   */
  _generateLogin () {
    const args = []
    if (!this.config.remote.enable) {
      return []
    }
    args.push('-I', 'lanplus')
    args.push('-P', this.config.remote.password)
    args.push('-U', this.config.remote.user)
    args.push('-H', this.config.remote.host)
    return args
  }

  /**
   *
   * @param {string} line
   * @returns {number} temp
   * @private
   */
  _findTemperature (line) {
    const regex = /(\d+) degrees/gm
    return parseInt([...line.matchAll(regex)].map(m => m[1])[0])
  }
}

export default Ipmi
