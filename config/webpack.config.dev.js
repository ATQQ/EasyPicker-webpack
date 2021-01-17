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
        proxy: { //反向代理
            '/server2': {
                target: 'https://ep.dev.sugarat.top/',
                changeOrigin: true,
            },
            '/EasyPicker': {
                target: 'https://ep.dev.sugarat.top/' || 'http://localhost:8080/EasyPicker',
                changeOrigin: true,
            }
        }
    }
}