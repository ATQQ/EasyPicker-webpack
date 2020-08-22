function freezeBtn(btn: JQuery<HTMLElement>) {
    btn.attr("disabled", "disabled")
}

function unFreezeBtn(btn: JQuery<HTMLElement>) {
    btn.removeAttr("disabled")
}

export default {
    freezeBtn,
    unFreezeBtn
}