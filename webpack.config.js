const path = require('path');

module.exports = {
  entry: './src/index.js', // 入口文件，根据您的项目结构调整
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js', // 输出文件名
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // 匹配 .js 和 .jsx 文件
        exclude: /node_modules/, // 排除 node_modules 目录
        use: {
          loader: 'babel-loader', // 使用 Babel 转译
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // 解析文件扩展名
  },
  devtool: 'source-map', // 生成源映射
  mode: 'development', // 开发模式
};
