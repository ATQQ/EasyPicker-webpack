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