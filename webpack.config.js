const path = require('path');

const packages = require('./packageList');
const {name: libName} = require('./package.json');
const {
  moduleProp,
  minify,
  banner,
} = require('./webpack.parts');

module.exports = ({modern}, {mode, cache}) => ({
  mode,
  entry: Object.entries(packages).reduce((entries, [pkg, file]) => (
    {...entries, [pkg]: path.resolve(file)}
  ), {}),
  devtool: 'source-map',
  output: {
    path: path.resolve('dist'),
    filename: `[name]${
      (modern ? '.modern' : '.legacy')
      +
      (mode === 'production' ? '.min' : '')
    }.js`,
    library: [libName, '[name]'],
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  module: modern ? {} : moduleProp(cache),
  optimization: mode === 'production' ? minify() : {},
  plugins: [
    banner,
  ],
});
