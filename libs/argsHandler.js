/**
 * the file for handler all terminal argumetns
 */

const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
const config = require('./config.js')
const funs = require('./funHandler.js')
console.log(argv)
// 设计思路，可以是先标准形式，麻烦形式，用来内部进行处理，然后暴露给用户的可以是简化的api
// 先按时有配置文件的方式，读取配置文件!,并与默认值合并!
// 然后再提供简化的形式进行处理

const userConfigPath = path.join(config.cwd, './x-html.config.js') // 项目配置文件路径

exports.start = () => {
  _configFile()
}


/**
 * use config file
 * if node conf, will use default conf
 * @return {[type]} [description]
 */
function _configFile () {
  const configExists = fs.existsSync(userConfigPath)
  if (!configExists) {
    return console.error('not find x-html.config.js', userConfigPath)
  }
  // combine default
  const userConfig = require(userConfigPath)
  Object.assign(config, {user: userConfig})
  Object.assign(config.combine, config.default, config.user)
  // 读取命令行参数，读取后保存到配置中
  // if (argv.port)
  funs.start()
}


/**
 * valid config file attribute
 * @return {[type]} [description]
 */
function _validConfig () {
  return true
}




