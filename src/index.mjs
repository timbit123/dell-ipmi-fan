import yaml from 'yaml'
import fs from 'fs'
import path from 'path'
import Ipmi from "./ipmi.mjs";
import Loop from './loop.mjs'

const configPath = path.join('config', 'config.yaml')
if(!fs.existsSync(configPath)){
  fs.copyFileSync(path.join('config', 'config.yaml.template'), configPath)
}
const settingsRaw = fs.readFileSync(configPath).toString()
const settings = yaml.parse(settingsRaw)
const ipmi = new Ipmi(settings)
const loop = new Loop(settings, ipmi)
loop.startLoop()

