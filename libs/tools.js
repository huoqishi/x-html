const fs = require('fs')
/**
 * 检测文件或者文件夹是否存在
 * @param  {string} path 需要检测的文件或者文件夹路径
 * @return {boolean}     为 true 表示存在
 */
const obj = module.exports = {}
obj.existsSync = path => {
  try{
      fs.accessSync(path,fs.F_OK);
    }catch(e){
      return false
    }
  return true
}

obj.isFile = path => {
  obj.existsSync(path) ? fs.statSync(optPath).isFile() : false
}
obj.isDirectory = path => {
  obj.existsSync(path) ? fs.statSync(optPath).isDirectory() : false
}
obj.mkdir = path => {
  if (!obj.existsSync(path)) {
    obj.mkdir(path.dirname(path))
    fs.mkdir(path, err => {
      console.log(err)
    })
  }
}

obj.mkdir('./xx')
