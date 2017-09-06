/**
 * 该文件提供对配置文件的处理, 默认的配置文件为x-html.config
 */
const path = require('path')
const configName = 'x-html.config.js' // 默认的配置文件名
const fs = require('fs')
const options = require('./options')

/**
 * 将用户配置文件与内置的options合并, config将覆盖options中的属性
 * @param  {Object} config 用户自定义的配置对象
 * @return {Object}        返回合并的配置文件
 */
const _combineConfig = (config) => {
  return Object.assign(options, config)
}

/**
 * 读取配置文件
 * @return {Object} 如果文件不存在，则返回null
 */
const _readConfig = () => {
  if (!fs.existsSync(path.join(options.cwd, configName))) {
    console.log(configName + ' is not found')
    return null
  }
  return require(path.join(options.cwd, configName))
}

/**
 * 根据output.path和output.filename的值计算出最终output.filepath的值
 * @return {[type]} [description]
 */
const _calcFilepath = () => {
  // 后期要修改成非固定的filename
  // 多入口时，filename暂时失效，文件保存到指定文件夹
  options.filepath = path.join(options.output.path, options.filename)
  options.filepath = path.dirname(options.filepath)
  return options
}

/**
 * 初始化配置文件
 * @return {Object} 合并后的配置文件， 配置文件不存在则返回null
 */
exports.initConfig = function () {
  const config = _readConfig()
  if (!config) return null
  const options = _combineConfig(config)
  _calcFilepath()
  return options
}
