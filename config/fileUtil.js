const path = require('path')
const fs = require('fs')
// 打包html
const htmlWebpackPlugin = require('html-webpack-plugin');
/**
 * 递归获取指定目录中的所有文件路径
 * @param {String} dir 目录名 
 * @returns {Array<String>} directorys 文件相对路径数组
 */
let getDirFiles = (dir) => {
    let result = []
    let files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach(file => {
        if (file.isFile()) {
            result.push(path.join(dir, file.name))
        } else {
            result.push(...getDirFiles(path.join(dir, file.name)))
        }
    })
    return result;
}

/**
 * 获取指定目录中所有文件,限定文件类型
 * @param {String} dir 目录
 * @param {String} type 文件类型(后缀) js/.js 
 */
let getDirFileByType = (dir, type) => {
    return getDirFiles(dir).filter(file => path.extname(file).endsWith(type))
}

/**
 * 获取指定目录中的所有文件的绝对路径
 * @param {String} dir 目录名 
 */
let getDirFilesWithFullPath = (dir) => {
    return getDirFiles(dir).map(file => path.resolve(file))
}


function getEntry(url, suffix = ".js") {
    const files = getDirFileByType(url, suffix)
    return files.reduce((pre, file) => {
        const filename = path.basename(file)
        const key = filename.slice(0, filename.lastIndexOf(suffix))
        pre[key] = './' + file
        return pre
    }, {})
}

function getHtml(filename, chunks, template, title = 'EasyPicker') {
    const minify = process.env.NODE_ENV === 'production'
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
    getDirFiles,
    getDirFileByType,
    getDirFilesWithFullPath,
    getEntry,
    getHtml
}