const baseUrl = '/EasyPicker/'

class AmazeUIModal {
    private alertEl

    constructor(id = 'AmazeUIModal') {
        const alertHtml = `<div id="${id}-alert" class="am-modal am-modal-alert" tabindex="-1" id="my-alert">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">提示</div>
            <div class="am-modal-bd" style="word-break: break-all;">
                Hello world！
            </div>
            <div class="am-modal-footer">
                <span class="am-modal-btn">确定</span>
            </div>
        </div>
    </div>`
        this.alertEl = $(alertHtml)
    }
    alert(textContent, title = '提示', close = true) {
        $(document.body).append(this.alertEl)
        this.alertEl.find('.am-modal-hd')[0].textContent = title
        this.alertEl.find('.am-modal-bd')[0].textContent = textContent
        this.alertEl.modal({
            closeViaDimmer: close //设置点击遮罩层能否关闭
        })
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
    return (str === null || str.trim() === '' || str === undefined)
}

/**
 * 列举一些placeholder值
 */
export const placeholders = {
    mobile: {
        errFormat: '手机号格式不正确',
        notExist: '手机号不存在',
        alreadyExist: '手机号已经存在'
    },
    code: {
        errFormat: '验证码格式不正确',
        notMatch: '验证码不匹配',
        notRight: '验证码错误'
    },
    password: {
        errFormat: '6-16位(数字/字母/@#$%)',
        notRight: '密码错误',
        twoDiff: '两次密码不一致'
    },
    username: {
        errFormat: '1-17位(数字/字母/中文/@._)',
        notExist: '账号不存在',
        alreadyExist: '账号已存在'
    }
}

/**
 * 设置Copy的内容
 */
function setCopyContent(shareUrl) {
    const tempCopy = document.getElementById('tempCopy')
    if (tempCopy) {
        tempCopy.setAttribute('href', shareUrl)
        tempCopy.textContent = shareUrl
    }
}

/**
* fixme: 耦合度过高，待修改
* 向指定路径发送下载请求 new,带弹窗二维码
* @param{String} url 请求路径
* @param {String} filename 文件名
*/
export function downLoadByUrl(url: string, filename = Date.now() + '') {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = filename
    a.click()
    setCopyContent(url)
    setEwm('ewm', url)
    amModal.alert('如未自动开始下载，请复制url到浏览器打开，也可将url分享给其它人进行下载(12h有效)', '下载提示')
    openModel('#copy-panel', false)
}

/**
 * 下载文件旧
 * @param url 
 * @param filename 
 */
export function downloadFile_old(url, filename = Date.now() + '') {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = filename
    a.click()
    amModal.alert(`如未自动开始下载，请复制url到浏览器打开，也可将url分享给其它人进行下载(12h有效)
    
    ${url}
    `, '下载提示', false)
}

/**
 * 设置二维码图片作为背景
 */
export function setEwm(id: string, url: string) {
    const $ewm = document.getElementById(id) as HTMLImageElement
    $ewm.src = createEwm(url)
}

export function getQiNiuUploadToken() {
    return $.get('/server2/' + 'file/qiniu/token')
}

export function stringEncode(str) {
    const div = document.createElement('div')
    if (div.innerText) {
        div.innerText = str
    } else {
        div.textContent = str//Support firefox
    }
    return div.innerHTML
}

export const baseAddress = location.protocol + '//' + location.host


export function getRandomStr(length) {
    const str = 'abcdefghijklmnopqrstuvwxyz0123456789'
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
    return (str == null || str.trim() == '')
}

/**
 * 打开指定弹出层
 * @param {String} id 弹出层id
 * @param {boolean} close 设置点击遮罩层是否可以关闭
 */
export function openModel(id, close = true) {
    $(id).modal({
        closeViaDimmer: close //设置点击遮罩层无法关闭
    })
    $(id).modal('open')
}


/**
 * 获取Url中的参数
 * @param url 地址Url 或者 Url中参数部分
 * @param paramName
 */
export function getUrlParam(url, paramName) {
    let isExist = false
    let res = null
    isExist = url.lastIndexOf(paramName + '=') !== -1
    if (isExist) {
        res = url.substring(url.indexOf(paramName + '=') + paramName.length + 1, (url.indexOf('&') > url.indexOf(paramName + '=') ? url.indexOf('&') : url.length))
    }
    return res
}

/**
 * 生成二维码，以base64返回
 * @param text 
 * @param config 
 */
export function createEwm(text: string, config?: AraleQRCode.config) {
    const canvasImg = new AraleQRCode({
        text,
        size: 145,
        foreground: '#000',
        ...config
    })
    return canvasImg.toDataURL('image/png')
}
/**
* 加载底部导航链接
*/
export function loadBottomLinks() {
    const $footer = document.createElement('footer')
    $footer.className = 'footer-nav am-container'
    const $ul = document.createElement('ul')
    $ul.className = 'am-u-lg-5 am-u-md-6 am-u-sm-12 am-center'
    $ul.id = 'bottom-links'
    $footer.append($ul)
    const links = [{
        href: '/',
        text: '首页'
    }, {
        href: 'https://github.com/ATQQ/EasyPicker',
        text: 'GitHub'
    },
    {
        href: 'https://sugar-js.gitbook.io/easypicker-manual/',
        text: '使用手册'
    },
    {
        href: 'https://www.wenjuan.com/s/UZBZJvA040/',
        text: '问题反馈'
    }
    ]
    const docFrag = document.createDocumentFragment()
    links.forEach((link) => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = link.href
        a.target = '_blank'
        a.textContent = link.text
        li.appendChild(a)
        $ul.appendChild(li)
    })
    docFrag.append($footer)
    document.body.append(docFrag)
}

function redirect(path: string) {
    return function () {
        window.location.href = path
    }
}
export const redirectAdmin = redirect('admin')
export const redirectHome = redirect('/')