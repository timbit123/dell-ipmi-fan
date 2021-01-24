import { spawn } from './spawn.mjs'
import { decToHex } from 'hex2dec'

class Ipmi {
  config = {}
  dynamicFanControlActivated = false
  lastPercentage

  /**
   *
   * @param config
   */
  constructor (config) {
    this.config = config
  }

  async updateFan () {
    const temp = await this.readTemps()
    const percentage = this._calculatePercentage(temp)

    // If same percentage don't update
    if (percentage !== this.lastPercentage) {
      this.lastPercentage = percentage
      await this.setFanSpeed(percentage)
    }
  }

  async readTemps () {
    const args = this._generateLogin()
    args.push('sdr', 'type', 'temp')
    const result = await spawn(this.config.ipmitool_bin_path, args)
    const line = result
      .split('\n')
      .filter(line => line.indexOf(this.config.fan.temp.pointer) !== -1)
    if (!line.length) {
      throw new Error(`Temperature not found, please update pointer setting\n${result}`)
    }
    const temp = this._findTemperature(line[0])
    console.log(`Current temperature for ${this.config.fan.temp.pointer} : ${temp} C`)
    return temp
  }

  async dynamicFanControl (activate = false) {
    const args = [...this._generateLogin(), 'raw', '0x30', '0x30', '0x01']
    if (activate) {
      args.push('0x01')
    } else {
      args.push('0x00')
    }
    const result = await spawn(this.config.ipmitool_bin_path, args)
    this.dynamicFanControlActivated = activate
    console.log(result)
  }

  async setFanSpeed (percentage) {
    if (this.dynamicFanControlActivated) {
      await this.dynamicFanControl(false)
    }
    const args = [...this._generateLogin(), 'raw', '0x30', '0x30', '0x02', '0xff']
    args.push(decToHex(percentage.toString()))
    console.log(`Setting fan to ${percentage}%`)
    await spawn(this.config.ipmitool_bin_path, args)
  }

  /**
   *
   * @param {number} deg
   * @returns {number} percentage
   * @private
   */
  _calculatePercentage (deg) {
    const { min, max, temp } = this.config.fan
    const deltaTemp = temp.max - temp.min
    const deltaFan = max - min
    const steps = deltaFan / deltaTemp
    if (deg < temp.min) {
      return min
    } else if (deg > temp.max) {
      return max
    } else {
      return Math.ceil((deg - temp.min) * steps + min)
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
