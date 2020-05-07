const path = require('path');
const webpack = require('webpack')
    // 打包html
const htmlWebpackPlugin = require('html-webpack-plugin');
//分离css
const extractTextPlugin = require('extract-text-webpack-plugin');
//清理打包
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 静态资源拷贝
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
    devServer: {
        contentBase: './dist', //项目基本访问目录
        host: 'localhost', //服务器ip地址
        port: 8088, //端口
        open: false, //自动打开页面
        hot: true, //模块热替换
        hotOnly: false, //只有热更新不会刷新页面
        proxy: { //跨域配置
            '/Api': {
                target: 'http://localhost:8080/EasyPicker',
                changeOrigin: true, //是否跨域
                pathRewrite: {
                    '^/Api': '' //规定请求地址以什么作为开头
                }

            }
        }
    },
    entry: {
        base: './src/assets/js/common/base.js',
        index: './src/assets/js/view/index.js',
        admin: './src/assets/js/view/admin.js',
        upload: './src/assets/js/view/upload.js'
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, './../dist')
    },
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname, 'src')
        ],
        alias: {
            jQuery: path.resolve(__dirname, '../src/assets/js/lib/jquery.min.js'), //引入jQuery
            webUploader: path.join(__dirname, '../src/assets/js/plunge/webuploader.js')
        }
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
                test: /\.less$/,
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'less-loader']
                })
            }, {
                test: /\.scss$/,
                include: [
                    path.resolve(__dirname, '../src/assets/sass')
                ],
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
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
                test: /\.(html)$/,
                loader: 'html-loader',
                options: {
                    attrs: ['img:src', 'img:data-src']
                }
            },
            {
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, '../src/assets/js/views')
                ],
                loader: 'babel-loader'
            },
            { //字体文件
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: "[name].[ext]",
                    outputPath: './fonts'
                }
            }

            // { //压缩css和js中的图片
            //     test: /\.(png|jpg|gif|jpeg)/, //匹配图片文件后缀名
            //     use: [{
            //         loader: 'url-loader', //指定使用的loader和loader的配置参数
            //         options: {
            //             limit: 5 * 1024, //是把小于5KB的文件打成Base64的格式，写入JS
            //             outputPath: './img/', //打包后的图片放到img文件夹下
            //         }
            //     }]
            // },
            // ,
            // { //html配置
            //     test: /\.(htm|html)$/i,
            //     use: ['html-withimg-loader']
            // }
        ]
    },
    // 配置插件
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            minify: {
                removeAttributeQuotes: false,
                removeComments: false, //去掉注释
                collapseWhitespace: false //去掉空白
            },
            chunks: ['base', 'index'], //引入对应的js
            template: 'src/index.html'
        }),
        new htmlWebpackPlugin({
            filename: 'admin.html',
            minify: {
                removeAttributeQuotes: false,
                removeComments: false, //去掉注释
                collapseWhitespace: false //去掉空白
            },
            chunks: ['base', 'admin'], //引入对应的js
            template: 'src/admin.html'
        }),
        new htmlWebpackPlugin({
            filename: 'upload.html',
            minify: {
                removeAttributeQuotes: false,
                removeComments: false, //去掉注释
                collapseWhitespace: false //去掉空白
            },
            chunks: ['base', 'upload'], //引入对应的js
            template: 'src/upload.html'
        }),
        new CleanWebpackPlugin(),
        new copyWebpackPlugin([{
                //上传插件
                from: path.join(__dirname, "../src/assets/js/plunge/webuploader.js"),
                to: path.join(__dirname, "../dist/js")
            },
            {
                //依赖的 flash
                from: path.join(__dirname, "../src/assets/js/plunge/Uploader.swf"),
                to: path.join(__dirname, "../dist/js")
            },
            {
                from: path.join(__dirname, "../src/assets/js/plunge/ZeroClipboard.swf"),
                to: path.join(__dirname, "../dist/js")
            },
            {
                from: path.join(__dirname, "../src/assets/js/plunge/amazeui.datatables.js"),
                to: path.join(__dirname, "../dist/js")
            },
            {
                from: path.join(__dirname, "../src/assets/js/lib/dataTables.responsive.min.js"),
                to: path.join(__dirname, "../dist/js")
            },
        ]),
        //css分离(输出文件名))
        new extractTextPlugin('css/[name].css'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            // $: "jQuery",
            // jQuery: "jQuery",
            // jquery: "jQuery",
            // webUploader: "webUploader",
            // webuploader: "webUploader"
        })
    ]
}