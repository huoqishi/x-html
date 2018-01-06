const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
const config = require('./config.js')
const tools = require('./tools.js')
const acorn = require('acorn')
const pretty = require('pretty') // 格式化 html
exports.start = start

const userConfName = 'x-html.config.js' // 用户配置文件名

function start () {
  handlerConfig()
  resolveConf()
  const entryType = getEnrty()
  config.entryType = entryType
  handlerEntryType(entryType)
}

/**
 * 读取用户配置文件
 */
function handlerConfig () {
  const userConfPath = path.join(config.cwd, userConfName)
  if (!tools.existsSync(userConfPath)) {
    throw new Error('配置文件不存在: ' + userConfPath)
  }
  const userConf = require(userConfPath)
  config.user = Object.assign(config.user, userConf)
}

/**
 * 验证及解析配置文件
 */
function resolveConf () {
  if (!config.user.entry) {
    throw new Error('配置文件中需要指定 entry')
  }
  if (!config.user.output) {
    throw new Error('配置文件中需要指定 output')
  }
  if (!config.user.output.path) {
    throw new Error('配置文件中需要指定 output.path')
  }
  if (!config.user.output.filename) {
    throw new Error('配置文件中需要指定 output.filename')
  }
  return true
}
/**
 * 获取入口 enrty 的类型
 */
function getEnrty () {
  const entry = config.user.entry
  const entryType = (typeof entry)
  if (entryType === 'string') {
    return 'string'
  }
  if (entry instanceof Array) {
    return 'array'
  }
  if (entryType === 'object') {
    return 'object'
  }
  throw new Error('entry只能是: string、array, object 类型 - ' + entryType)
}

/**
 * 根据入口文件的类型进行处理
 */
function handlerEntryType (entryType) {
  switch (entryType) {
    case 'string':
      joinAndHandleFile(config.user.entry)
      break
    case 'array':
      config.user.entry.forEach(item => {
        joinAndHandleFile(item)
      })
      break
    case 'object': break
  }
}

/**
 * 将相对路径与cwd合并，并调用handlerFile方法
 * @param  {[type]} relativePath [description]
 * @return {[type]}              [description]
 */
function joinAndHandleFile (relativePath) {
  const absolutePath = path.join(config.cwd, relativePath)
  handleFile(absolutePath, true)
}

/**
 * 根据路径解析文件中的template, style, script
 */
function handleFile (filepath, isEntry) {
  const fileData = parseFile(filepath, isEntry)
  replaceBody(fileData)
  let outPath
  outPath = getOutPath(filepath)
  const outHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
${fileData.head}
<style>
${fileData.style}
</style>
</head>
<body>
${fileData.body}
</body>
</html>
`
  fs.writeFile(outPath, pretty(outHtml), err => {
    if (err) {
      throw err
    }
  })
}

/**
 * 替换 fileData.body中的模块
 */
function replaceBody (fileData) {
  const bodys = resolveImport(fileData)
  if (bodys.length === 0) {
    config.modules[fileData.filepath] = fileData
    return fileData
  }
  bodys.forEach(item => {
    let module = config.modules[item.value]
    const regStr = '<' + item.name + '\\s*></' + item.name + '>| <' + item.name + '\\s*/>'
    const reg = new RegExp(regStr, 'ig')
    if (!module) {
      const tmpData = parseFile(item.value)
      replaceBody(tmpData)
      fileData.body = fileData.body.replace(reg, tmpData.body)
      // fileData.style = fileData.style.replace(reg, tmpData.style)
      fileData.style += tmpData.style
      return
    }
    fileData.body = module.body.replace(reg, module.body)
    fileData.style += module.style
  })

  // const fileDatas = parseFiles(bodys)
  // fileDatas.forEach(item => {
  //   // const bodys = resolveImport(item)
  //   // if (bodys.length <= 0) {
  //   //   const regStr = '<'+ item.name +'\\s*></'+ item.name +'>| <'+ item.name +'\\s*/>'
  //   //   fileData.body.replace(new RegExp(regStr), item.body)
  //   //   // fileDatas.forEach(tmpData => {

  //   //   // })
  //   //   return
  //   // }
  //   replaceBody(item)
  //   console.log('ok')
  //   // console.log(fileData)
  // })
  // replaceBody(fileData)
}

/**
 * 计算当输出文件名
 * @return {[type]} [description]
 */
function getOutPath (filepath) {
  if (config.user.entryType === 'string') {
    return outPath = path.join(config.user.output.path, config.user.output.filename)
  }
  // 根据原路径进行相应输出!
  const relativePath = path.relative(config.cwd, path.dirname(filepath))
  const outputPath = path.join(config.cwd, config.user.output.path, relativePath)
  console.log(outputPath)
  tools.mkdirSync(outputPath)
  return path.join(outputPath, path.basename(filepath))
}

/**
 * 根据filepath读取文件并返回包含文件信息的对象
 * const fileData = {
    head: '',
    body: '',
    style: '',
    script: '',
    filepath: filepath,
    isEntry: isEntry ? true : false
  }
 */
function parseFile (filepath, isEntry) {
  const fileData = {
    head: '',
    body: '',
    style: '',
    script: '',
    filepath: filepath,
    isEntry: !!isEntry
  }
  if (!tools.existsSync(filepath)) {
    const err = '文件不存在: ' + filepath
    throw new Error(err)
  }
  let data
  try {
    data = fs.readFileSync(fileData.filepath, 'utf-8')
  } catch (e) {
    throw new Error('entry, 入口文件读取出错: ' + filepath)
  }
  if (fileData.isEntry) {
    const head = /<head>(\n|\r\n)((\s|\S)*)(\n|\r\n)<\/head>/.exec(data)
    fileData.head = (head instanceof Array) ? head[2] : ''
  }
  const template = /<template>(\n|\r\n)((\s|\S)*)(\n|\r\n)<\/template>/.exec(data)
  const body = /<body>(\n|\r\n)((\s|\S)*)(\n|\r\n)<\/body>/.exec(data)
  const script = /<script>(\n|\r\n)((\s|\S)*)(\n|\r\n)<\/script>/.exec(data)
  const style = /<style>(\n|\r\n)((\s|\S)*)(\n|\r\n)<\/style>/.exec(data)
  fileData.body = (body instanceof Array) ? body[2] : ''
  if (!fileData.body) {
    fileData.body = (template instanceof Array) ? template[2] : ''
  }
  fileData.script = (script instanceof Array) ? script[2] : ''
  fileData.style = (style instanceof Array) ? style[2] : ''
  console.log(fileData)
  return fileData
}

/**
 * 获取多个
 * @param  {[type]} bodys [description]
 * @return {[type]}       [description]
 */
function parseFiles (bodys) {
  const fileDatas = []
  bodys.forEach(item => {
    // const regStr = '<'+ item.name +'\\s*></'+ item.name +'>| <'+ item.name +'\\s*/>'
    // const sonModule = config.modules[item.value]
    // if (sonModule) {
    //   fileData.body.replace(new RegExp(regStr), sonModule.body)
    //   return
    // }
    if (!tools.existsSync(item.value)) {
      const err = '文件不存在: ' + item.value
      throw new Error(err)
    }
    const tmpFileData = parseFile(item.value, false)
    fileDatas.push(tmpFileData)
  })
  return fileDatas
}
// 解析import from 语法
// 解析出import 的变量名, 和文件路径
/**
 * @param  {Object} filedata 要解析的文件的数据(html, css, js)
 * @return {Array} 返回js代码中import语法中变量名与文件路径的组合体 [{name: 变量名, value: 对应文件绝对路径路径!}]
 * import Btn from './btn.html'
 * [
 *   {Btn: 'c:/xx/xx/yy/btn.html'}
 * ]
 */
function resolveImport (fileData) {
  const result = acorn.parse(fileData.script, { sourceType: 'module' })
  const bodys = []
  result.body.forEach(item => {
    const name = item.specifiers[0].local.name
    let value = path.join(path.dirname(fileData.filepath), item.source.value)
    bodys.push({name, value})
  })
  return bodys
}
