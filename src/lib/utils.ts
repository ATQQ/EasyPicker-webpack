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