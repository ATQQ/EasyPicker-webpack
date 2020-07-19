let baseUrl = "/EasyPicker/";

function stringEncode(str) {
    var div = document.createElement('div');
    if (div.innerText) {
        div.innerText = str;
    } else {
        div.textContent = str;//Support firefox
    }
    return div.innerHTML;
}
const baseAddress = location.protocol + '//' + location.host

function getRandomStr(length) {
    const str = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const res = []
    while (length) {
        const index = ~~(Math.random() * (length + 1) * 1000) % str.length
        res.push(str[index])
        length--
    }
    return res.join('')
}
class AlertModal {
    constructor() {
        const id = getRandomStr(10)
        const el = `<div id="${id}" class="am-modal am-modal-alert" tabindex="-1" id="my-alert">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">提示</div>
            <div class="am-modal-bd">
                Hello world！
            </div>
            <div class="am-modal-footer">
                <span class="am-modal-btn">确定</span>
            </div>
        </div>
    </div>`
        $(document.body).append(el)
        this.modal = $(`#${id}`)
    }
    show(textContent, title = "提示") {
        this.modal.find('.am-modal-hd')[0].textContent = title
        this.modal.find('.am-modal-bd')[0].textContent = textContent
        this.modal.modal('open')
    }
}

/**
 * 判断字符串是否为空
 * @param str
 * @returns {boolean}
 */
function isEmpty(str) {
    return (str == null || str.trim() == '');
}

/**
 * 打开指定弹出层
 * @param {String} id 弹出层id
 * @param {boolean} close 设置点击遮罩层是否可以关闭
 */
function openModel(id, close) {
    $(id).modal({
        closeViaDimmer: close //设置点击遮罩层无法关闭
    });
    $(id).modal('open');
}

/**
 * 向指定路径发送下载请求
 * @param{String} url 请求路径
 * @param {String} filename 文件名
 */
function downLoadByUrl(url, filename) {
    let xhr = new XMLHttpRequest();
    //GET请求,请求路径url,async(是否异步)
    xhr.open('GET', url, true);
    //设置请求头参数的方式,如果没有可忽略此行代码
    // xhr.setRequestHeader("token", token);
    //设置响应类型为 blob
    xhr.responseType = 'blob';
    //关键部分
    xhr.onload = function (e) {
        //如果请求执行成功
        if (this.status == 200) {
            let blob = this.response;
            // let filename = "我是文件名.xxx";//如123.xls
            let a = document.createElement('a');

            blob.type = "multipart/form-data";
            //创键临时url对象
            let url = URL.createObjectURL(blob);

            a.href = url;
            a.download = filename;
            a.click();
            //释放之前创建的URL对象
            window.URL.revokeObjectURL(url);
        }
    };
    //发送请求
    xhr.send();
}

/**
 * 获取Url中的参数
 * @param url 地址Url 或者 Url中参数部分
 * @param paramName
 */
function getUrlParam(url, paramName) {
    let isExist = false;
    let res = null;
    isExist = url.lastIndexOf(paramName + '=') !== -1;
    if (isExist) {
        res = url.substring(url.indexOf(paramName + '=') + paramName.length + 1, (url.indexOf('&') > url.indexOf(paramName + '=') ? url.indexOf('&') : url.length));
    }
    return res;
}

function getQiNiuUploadToken() {
    return $.get(baseUrl + "file/qiniu/token")
}
export {
    stringEncode,
    baseAddress,
    getRandomStr,
    AlertModal,
    isEmpty,
    openModel,
    downLoadByUrl,
    getUrlParam,
    getQiNiuUploadToken
}