const path = require('path');
const webpack = require('webpack')
const os = require('os')
const { getEntry,getHtml } = require('./fileUtil')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
        loaders: ['babel-loader?cacheDirectory']
    })
    // new HappyPack({
    //     id: 'happyScss',
    //     threadPool: happypackThreadPool,
    //     loaders: ['style-loader', 'css-loader', 'sass-loader']
    // })
]

module.exports = {
    mode: 'production',
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
        extensions: [".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, '../src'),
            "apis": path.resolve(__dirname, "../src/assets/js/apis"),
        },
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
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, '../src/assets/js/view')
                ],
                exclude: /node_modules/,
                loader: 'happypack/loader?id=happyBabel'
            },
            {
                test: /\.ts$/,
                use:['ts-loader']
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
        new optimizeCssAssetsWebpackPlugin(),
        // new BundleAnalyzerPlugin()
    ],
}