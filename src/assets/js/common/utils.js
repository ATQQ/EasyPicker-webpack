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

class AmazeUIModal {
    constructor(id = 'AmazeUIModal') {
        const alertHtml = `<div id="${id}-alert" class="am-modal am-modal-alert" tabindex="-1" id="my-alert">
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
        this.alertEl = $(alertHtml)
    }
    alert(textContent, title = "提示") {
        $(document.body).append(this.alertEl)
        this.alertEl.find('.am-modal-hd')[0].textContent = title
        this.alertEl.find('.am-modal-bd')[0].textContent = textContent
        this.alertEl.modal('open')
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
    let a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = filename;
    a.click();
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
/**
 * 封装的妹子UI弹窗
 */
const amModal = new AmazeUIModal()
export {
    stringEncode,
    baseAddress,
    getRandomStr,
    AlertModal,
    isEmpty,
    openModel,
    downLoadByUrl,
    getUrlParam,
    getQiNiuUploadToken,
    amModal
}