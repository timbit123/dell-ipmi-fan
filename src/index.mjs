import Ipmi from './ipmi.mjs'
import Loop from './loop.mjs'
import Config from './config.mjs'

const config = Config.loadFromFile()
const ipmi = new Ipmi(config)
const loop = new Loop(config, ipmi)
loop.startLoop()
