const path = require('path');
const webpack = require('webpack')
const os = require('os')
const { getEntry, getHtml } = require('./fileUtil')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//清理打包
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 静态资源拷贝
const copyWebpackPlugin = require('copy-webpack-plugin');
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
        loaders: ['babel-loader?cacheDirectory']
    })
    // new HappyPack({
    //     id: 'happyScss',
    //     threadPool: happypackThreadPool,
    //     loaders: ['style-loader', 'css-loader', 'sass-loader']
    // })
]

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: './dist', //项目基本访问目录
        host: 'localhost', //服务器ip地址
        port: 8088, //端口
        open: true, //自动打开页面
        hot: true, //模块热替换
        hotOnly: false, //只有热更新不会刷新页面
        proxy: { //跨域配置
            '/EasyPicker': {
                target: 'http://sugarat.top:8080/EasyPicker-Server-dev-1.0' || 'http://localhost:8080/EasyPicker',
                changeOrigin: true, //是否跨域
                pathRewrite: {
                    '^/EasyPicker': '' //规定请求地址以什么作为开头
                }
            }
        }
    },
    entry: {
        base: './src/assets/js/common/base.js',
        ...getEntry('./src/assets/js/view'),
        ...getEntry('./src/assets/js/view','.ts')
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
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    // 'postcss-loader',
                    'sass-loader',
                ]
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
                test: /\.ts$/,
                use:['ts-loader']
            },
            {
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, '../src/assets/js/view')
                ],
                exclude: /node_modules/,
                loader: 'happypack/loader?id=happyBabel'
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
        ...happyPackLoaders,
        //css分离(输出文件名))
        new MiniCssExtractPlugin({
            // 类似 webpackOptions.output里面的配置 可以忽略
            filename: 'css/[name]-[hash].css',
            chunkFilename: 'css/[id]-[hash].css',
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
}