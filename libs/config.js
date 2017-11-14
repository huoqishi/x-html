 /**
 * 各种参数都存储于options对象中
 * 包含【默认配置】，【用户配置】，【合并(默认与用户的配置后的配置)】
 * @type {Object}
 */
const options = {
  // 必需要有的一些属性, 用户如果没有指定的话，则给出一些提示
  modules: { // 缓存所有模块

  },
  cwd: process.cwd(), // 终端路径
  // 默认配置
  default: {
    // 如果entry是个路径而不文件夹，则该路径下所有文件都将作为入口文件
    // entry: '' , // 入口文件, 可以是一个字符串，可以是一个数组，也可以是一个对象(是对象时，对象的key将作为打包后的文件名)
    // path 和 filename的值将会使用path.join进行合并
    output: {
      path: '',   // 出口文件的存储路径
      filename: '' // 出口文件的文件名, [name] , [ext]
    },
    css: '', // 可取值 'inline', 'module-one', 'all-one'
    config: '', // 指定配置文件的路径
  },
  // 用户配置
  user: {
  },
  combine: {} // 合并用户和默认的配置
}

module.exports = options
