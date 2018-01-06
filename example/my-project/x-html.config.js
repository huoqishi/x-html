module.exports = {
  // type  string|Object|Array
  // entry: [
  //  './index.html',
  //  // './header.html'
  // ],
  // entry: './index.html',
  // 后期考虑是否要改为使用glob来匹配
  entry: [
    './index.html'
  ],
  output: {
    path: './dist',
    filename: '[name].[ext]'
  }
}
