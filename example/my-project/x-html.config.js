module.exports = {
  // type  string|Object|Array
  // entry: [
  //  './index.html',
  //  // './header.html'
  // ],
  // entry: './index.html',
  entry: [
    './index.html',
    './header/header.html'
  ],
  output: {
    path: './dist',
    filename: '[name].[ext]',
  }
}
