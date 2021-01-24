import path from 'path'
import fs from 'fs'
import yaml from 'yaml'

class Config {
  ipmitoolBinPath = 'ipmitool'
  looptime = 5000
  fan = {
    max: 100,
    min: 10
  }

  temp = {
    pointer: 'Exhaust',
    max: 70,
    min: 30
  }

  remote = {
    enable: false,
    user: 'root',
    host: '',
    password: ''
  }

  constructor (config) {
    Object.assign(this, config)
  }

  /**
   * Load yaml and return a config object
   * @returns {Config}
   */
  static loadFromFile () {
    const configPath = path.join('..', 'config', 'config.yaml')
    if (!fs.existsSync(configPath)) {
      fs.copyFileSync(path.join('..', 'config', 'config.yaml.template'), configPath)
    }
    const fileString = fs.readFileSync(configPath).toString()
    return new Config(yaml.parse(fileString))
  }
}

export default Config
