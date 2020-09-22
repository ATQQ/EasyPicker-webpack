/* eslint-disable */

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
    }
}