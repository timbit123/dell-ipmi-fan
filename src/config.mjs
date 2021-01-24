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
}

export default Config
