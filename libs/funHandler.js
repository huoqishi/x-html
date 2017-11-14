/**
 * 该文件主要负责提供各种对文件进行处理的函数，不对终端参数进行较验
 */

const config = require('./config')
const fs = require('fs')
const path = require('path')
const acorn = require('acorn')
const walk = require('acorn/dist/walk')

// 命令行指定入口文件, 指定输出文件，依次加载依赖的文件，进行合并
// const args = process.argv.splice(2)

// const cwd = process.cwd()
// const entry = args[0]
// const output = args[1]

const {combine}  = config // 合并后的配置!

/**
 * 整个程序启动的入口
 * 
 * @return {undefined}
 */
exports.start = () => {
  // complie(combine.entry)
  // console.log(998)
  _disEntry()
}


/**
 * 区分entry不同的值类型，做出相应的处理
 * @return {[type]} [description]
 */
function _disEntry () {
   
   if (typeof combine.entry === 'string') {
      const item = combine.entry
      const entryFile = path.join(config.cwd, item) // combined  entry path
      complie(entryFile)
      return
   }

   if (combine.entry instanceof Array) {
    combine.entry.forEach(item => {
      const entryFile = path.join(config.cwd, item) // combined  entry path
      complie(entryFile)
    })
    return
   }
}

/*
 * arguments valid
*/

// 这里发现一个奇怪的现象, start方法是在start解析后立即被调用，并没有等到compile被解析，如果compile申明在start下面就会报undefined
// start()

/**
 * 递归编译模板, 参数验证通过后,start 需要调用此函数
 * @param  {[string]} filepath 要读取的文件的绝对路径
 * */
// function complie (filepath, originalFile) {
function complie (filepath) {
  const parentData = getFile(filepath)
  const bodys = resolveImport(parentData)
  console.log('*'.repeat(99))
  console.log(bodys)
  const dirname = path.dirname(filepath)
  const fileDatas = getFiles(bodys, dirname)
  fileDatas.forEach(fileData => {
    console.log(fileData)
    const bodys = resolveImport(fileData)
    console.log(bodys.length)

    // 判断该文件中有没有引入其他html文件,如果有则bodys数组长度 大于 0
    if (bodys.length <= 0) {
      mergeFileData(parentData, fileDatas)
      return
    }
    complie(path.join(dirname, item.value), originalFile)
  })
  
  console.log('---------------------------')
  console.log(parentData)
  let str = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <title></title>
  <style>
    ${parentData.style}
  </style>
</head>
<body>
  ${parentData.template}
</body>
</html>
  `

  // console.log('保存文件')
  // 后期不直接存在，要改成，根据filepath中的路径动态存储
  const optPath =  path.join(config.cwd, combine.output.path)
  console.log('================')
  console.log('optPath', optPath)
  console.log('combine', combine)
  const status = fs.statSync(optPath)
  console.log(status.isFile())
  if (status.isDirectory()) {
    console.log('准备存储文件--')
    const filepath =  path.join(config.cwd, combine.output.path, combine.output.filename)
    fs.writeFile(filepath, str)
  }
}


/**
 * 读取并拆分文件内容,将文件拆分为html, js(引入的html), css 三部分
 * 
 * @param {string} filepath 要读取的文件的绝对路径
 * @return {Object} fileData 文件数据 fileData => {template,style,script}
 */
function getFile (filepath) {
  const data = fs.readFileSync(filepath, 'utf-8')
  // fileData用于保存模板中的html,css,js
  const fileData = {
    filepath,
    template: '',
    style: '',
    script: ''
  }
  
  // 读取模板中template,style,script标签中的内容!
  const templateResult = /<template>((\s|\S)*)<\/template>/.exec(data)
  const styleResult = /<style>((\s|\S)*)<\/style>/.exec(data)
  const scriptResult = /<script>((\s|\S)*)<\/script>/.exec(data)
  fileData.template = templateResult ? templateResult[1] : ''
  fileData.style = styleResult ? styleResult[1] : ''
  fileData.script = scriptResult ? scriptResult[1] : ''
  return fileData
  // 将解析后的文件写入到新的文件中去
  // fs.writeFile(path.join(cwd, output), fileData.template + fileData.style, function wirteHandler (err) {
  //   if (err) {
  //     return console.error(err)
  //   }
  //   console.log('file generated successfully')
  // })
  // fs.readFile(filepath, 'utf-8', (err, data) => {
  //   if (err) {
  //     return console.error(err)
  //   }
    
  // })
}

// 解析import from 语法
// 解析出import 的变量名, 和文件路径
/**
 * @param  {Object} filedata 要解析的文件的数据(html, css, js)
 * @return {Array} 返回js代码中import语法中变量名与文件路径的组合体 {变量名: 对应文件绝对路径路径!}
 */
function resolveImport (filedata) {
  // // 正则匹配import from 且要判断外层没有引号
  // const regExp = /import\s+(\S+)\s+from\s+('|")(\S+)('|")/gi
  // const comArr = []
  // console.log(script)
  const result = acorn.parse(filedata.script, { sourceType: 'module' })
  const bodys = []
  result.body.forEach(item => {
    const name = item.specifiers[0].local.name
    let value = item.source.value


    bodys.push({name, value})
    // // 根据value读取相应的文件, 并将读取的内容替换字符串中的同名标签
    // fs.readFile(path.join(dirname, value), 'utf-8', (err, data) => {
    //   console.log(data)
    // })
  })
  return bodys
}

/**
 * @param {Array} parseBodys 文件标签名和文件路径
 * @param  {String} dirname 父级文件的目录
 * @return {Object}
 */
function getFiles (parseBodys, dirname) {
  const fileDatas = []
  parseBodys.forEach(item => {
    // 根据item.value和dirname读取相应的文件
    // 如果读取出的文件中有import 则继续解析
    // 如果没有import 则将读取的内容替换到fileData.template 中和item.name同名的标签
    const fileData = getFile(path.join(dirname, item.value))
    fileData.info = item
    fileDatas.push(fileData)
  })
  return fileDatas
}

/**
 * 合并父组合文件与子级文件
 * 
 * @param  {Object} parentData 父级的文件数据对象
 * @param  {[Object]} childDatas 所有直接子级文件中的数据对象
 * @return {[Object]} parentData 与参数parentData地址相同
 */
function mergeFileData (parentData, childDatas) {
  childDatas.forEach(item => {

    // const regExp = new RegExp(`(<${item.info.name}\s*\/\s*>)|(<${item.info.name}\s*></${item.info.name}>)`)
    const regExp = new RegExp('(<' + item.info.name + '\\s*\/\\s*>)|(<' + item.info.name + '\\s*></' + item.info.name + '>)')
    parentData.template = parentData.template.replace(regExp, item.template)
    parentData.style += item.style

  })
  return parentData
}
