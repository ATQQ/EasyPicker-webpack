const path = require('path');
const webpack = require('webpack')
const os = require('os')
const { getDirFileByType } = require('./fileUtil')
// 打包html
const htmlWebpackPlugin = require('html-webpack-plugin');
//分离css
const extractTextPlugin = require('extract-text-webpack-plugin');
//清理打包
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 静态资源拷贝
const copyWebpackPlugin = require('copy-webpack-plugin');
// 文件大小可视化
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// 压缩css
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
// happypack
const HappyPack = require('happypack')
// 创建线程池
const happypackThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
})

const happyPackLoaders = [
    new HappyPack({
        id: 'happyBabel',
        threadPool: happypackThreadPool,
        loaders: ['babel-loader']
    }),
    new HappyPack({
        id: 'happyScss',
        threadPool: happypackThreadPool,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
    })
]

// 是否是生产环境
const isProduction = process.env.NODE_ENV === 'production'

function getEntry(url) {
    const files = getDirFileByType(url, '.js')
    return files.reduce((pre, file) => {
        const filename = path.basename(file)
        const key = filename.slice(0, filename.lastIndexOf('.js'))
        pre[key] = './' + file
        return pre
    }, {})
}

function getHtml(filename, chunks, template, title = 'EasyPicker') {
    const minify = isProduction
    return new htmlWebpackPlugin({
        filename,
        minify: {
            collapseWhitespace: minify,
            removeComments: minify,
            removeRedundantAttributes: minify,
            removeScriptTypeAttributes: minify,
            removeStyleLinkTypeAttributes: minify,
            useShortDoctype: minify
        },
        chunks, //引入对应的js
        template,
        title: title,
        scriptLoading: 'defer',
        favicon: './src/assets/img/i/favicon.png',
        meta: {
            viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no',
            description: 'EasyPicker-轻取，方便的在线文件收取助手',
            keywords: '文件收取, 轻取, 在线文件收取, EasyPicker, 文件搜集, 文件收取, 文档收取, 在线文档收取',
            render: 'webkit'
        },
        hash: true // 清除缓存
    })
}
module.exports = {
    mode: isProduction ? 'production' : 'development',
    devServer: {
        contentBase: './dist', //项目基本访问目录
        host: 'localhost', //服务器ip地址
        port: 8088, //端口
        open: false, //自动打开页面
        hot: true, //模块热替换
        hotOnly: true, //只有热更新不会刷新页面
        proxy: { //跨域配置
            '/EasyPicker': {
                target: 'http://sugarat.top:8080/EasyPicker-Server-1.0' && 'http://localhost:8080/EasyPicker',
                changeOrigin: true, //是否跨域
                pathRewrite: {
                    '^/EasyPicker': '' //规定请求地址以什么作为开头
                }
            }
        }
    },
    entry: {
        base: './src/assets/js/common/base.js',
        ...getEntry('./src/assets/js/view')
    },
    output: {
        filename: 'js/[name]-[hash].js',
        path: path.resolve(__dirname, './../dist')
    },
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname, 'src')
        ]
    },
    module: {
        // 配置loader
        rules: [{
            test: /\.css/,
            use: extractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                    'css-loader'
                ],
                publicPath: '../'
            })
        }, {
            test: /\.scss$/,
            include: [
                path.resolve(__dirname, '../src/assets/sass')
            ],
            loader: ['style-loader','css-loader', 'sass-loader']
        },
        {
            test: /\.(png|jpg|gif|jpeg)$/,
            loader: 'file-loader',
            options: {
                name: '[hash].[ext]',
                outputPath: './img',
                esModule: false
            }
        },
        {
            test: /\.js?$/,
            include: [
                path.resolve(__dirname, '../src/assets/js/view')
            ],
            loader: ['babel-loader?cacheDirectory']
        },
        { //字体文件
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file-loader',
            options: {
                name: "[name].[ext]",
                outputPath: './fonts'
            }
        }
        ]
    },
    // 配置插件
    plugins: [
        getHtml('index.html', ['base', 'index'], 'src/index.html', 'EasyPicker-轻取 首页'),
        getHtml('admin/index.html', ['base', 'admin'], 'src/admin.html', 'EasyPicker-轻取 管理'),
        getHtml('upload/index.html', ['base', 'upload'], 'src/upload.html', 'EasyPicker-轻取 提交文件'),
        new CleanWebpackPlugin(),
        // ...happyPackLoaders,
        //css分离(输出文件名))
        new extractTextPlugin('css/[name]-[hash].css'),
        new webpack.HotModuleReplacementPlugin(),
        new optimizeCssAssetsWebpackPlugin(),
        // new BundleAnalyzerPlugin()
    ],
}