function stringEncode(str) {
    var div = document.createElement('div');
    if (div.innerText) {
        div.innerText = str;
    } else {
        div.textContent = str;//Support firefox
    }
    return div.innerHTML;
}
const baseAddress = location.protocol + '//' + location.hostname
export {
    stringEncode,
    baseAddress
}