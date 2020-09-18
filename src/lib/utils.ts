let baseUrl = "/EasyPicker/";

class AmazeUIModal {
    private alertEl

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
export const amModal = new AmazeUIModal()

/**
 * 判断字符串是否为空
 * @param str
 * @returns {boolean}
 */
export function isStrEmpty(str: string) {
    return (str === null || str.trim() === '' || str === undefined);
}

/**
 * 列举一些placeholder值
 */
export const placeholders = {
    mobile: {
        errFormat: "手机号格式不正确",
        notExist: "手机号不存在",
        alreadyExist: "手机号已经存在"
    },
    code: {
        errFormat: "验证码格式不正确",
        notMatch: '验证码不匹配',
        notRight: '验证码错误'
    },
    password: {
        errFormat: "6-16位(数字/字母/@#$%)",
        notRight: '密码错误',
        twoDiff: "两次密码不一致"
    },
    username: {
        errFormat: "1-17位(数字/字母/中文/@._)",
        notExist: "账号不存在",
        alreadyExist: "账号已存在"
    }
}

/**
* 向指定路径发送下载请求
* @param{String} url 请求路径
* @param {String} filename 文件名
*/
export function downLoadByUrl(url: string, filename = Date.now() + '') {
    let a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = filename;
    a.click();
}

export function getQiNiuUploadToken() {
    return $.get(baseUrl + "file/qiniu/token")
}

export function stringEncode(str) {
    var div = document.createElement('div');
    if (div.innerText) {
        div.innerText = str;
    } else {
        div.textContent = str;//Support firefox
    }
    return div.innerHTML;
}

export const baseAddress = location.protocol + '//' + location.host


export function getRandomStr(length) {
    const str = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const res: string[] = []
    while (length) {
        const index = ~~(Math.random() * (length + 1) * 1000) % str.length
        res.push(str[index])
        length--
    }
    return res.join('')
}

/**
 * 判断字符串是否为空
 * @param str
 * @returns {boolean}
 */
export function isEmpty(str) {
    return (str == null || str.trim() == '');
}

/**
 * 打开指定弹出层
 * @param {String} id 弹出层id
 * @param {boolean} close 设置点击遮罩层是否可以关闭
 */
export function openModel(id, close) {
    $(id).modal({
        closeViaDimmer: close //设置点击遮罩层无法关闭
    });
    $(id).modal('open');
}


/**
 * 获取Url中的参数
 * @param url 地址Url 或者 Url中参数部分
 * @param paramName
 */
export function getUrlParam(url, paramName) {
    let isExist = false;
    let res = null;
    isExist = url.lastIndexOf(paramName + '=') !== -1;
    if (isExist) {
        res = url.substring(url.indexOf(paramName + '=') + paramName.length + 1, (url.indexOf('&') > url.indexOf(paramName + '=') ? url.indexOf('&') : url.length));
    }
    return res;
}