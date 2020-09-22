/* eslint-disable */

// 文件大小可视化
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// 压缩css
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')


module.exports = {
    mode: 'production',
    // 配置插件
    plugins: [
        new optimizeCssAssetsWebpackPlugin(),
        // new BundleAnalyzerPlugin()
    ],
}