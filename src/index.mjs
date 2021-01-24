import yaml from 'yaml'
import fs from 'fs'
import path from 'path'
import Ipmi from "./ipmi.mjs";
import Loop from './loop.mjs'

const configPath = path.join('config', 'config.yaml')
if(!fs.existsSync(configPath)){
  fs.copyFileSync(path.join('config', 'config.yaml.template'), configPath)
}
const rawConfig = fs.readFileSync(configPath).toString()
const config = yaml.parse(rawConfig)
const ipmi = new Ipmi(config)
const loop = new Loop(config, ipmi)
loop.startLoop()

