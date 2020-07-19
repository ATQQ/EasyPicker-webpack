let baseUrl = "/EasyPicker/";
const token = localStorage.getItem("token");

/**
 * 查询文件是否存在
 */
function checkFileIsExist(username, course, tasks, filename) {
    return $.ajax({
        type: 'get',
        url: baseUrl + "file/check",
        data: {
            username,
            course,
            tasks,
            filename
        }
    })
}

/**
 * 获取文件数量
 * @param {String} username 
 * @param {String} course 
 * @param {String} tasks 
 */
function checkFileCount(username, course, tasks) {
    return $.ajax({
        type: 'get',
        url: baseUrl + "file/count",
        data: {
            username,
            course,
            tasks,
        }
    })
}

/**
 * 获取文件下载链接
 */
function getFileDownloadUrl(username, course, tasks, filename) {
    return $.ajax({
        type: 'get',
        url: baseUrl + "file/qiniu/download",
        data: {
            username,
            course,
            tasks,
            filename
        }
    })
}

function compressOssFile(username, course, tasks) {
    return $.ajax({
        type: 'post',
        url: baseUrl + "file/qiniu/compress",
        headers: {
            "token": token,
            "Content-Type": "application/json;charset=utf-8"
        },
        data: JSON.stringify({
            username,
            course,
            tasks
        })
    })
}

function getcompressFileStatus(url) {
    return $.ajax({
        type: 'post',
        url: baseUrl + "file/qiniu/compress/status",
        headers: {
            "token": token,
            "Content-Type": "application/json;charset=utf-8"
        },
        data: JSON.stringify({
            url
        })
    })
}
export default {
    checkFileIsExist,
    getFileDownloadUrl,
    checkFileCount,
    compressOssFile,
    getcompressFileStatus
}