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
        this.modal.modal('toggle')
    }
}
export {
    stringEncode,
    baseAddress,
    getRandomStr,
    AlertModal
}