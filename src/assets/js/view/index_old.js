console.log('index');
// 样式表
import '../../css/index.css'
import '../../sass/modules/index.scss'

//剪贴板插件
import ZeroClipboard from '../plunge/ZeroClipboard.min.js'
const clip = new ZeroClipboard($('#test'));
clip.on('ready', function() {
    console.log("Clip ready");
    this.on('aftercopy', function(event) {
        alert("链接已经复制到剪贴板");
    });
});

clip.on('error', function(e) {
    console.log('flash禁用')
});
$(document).ready(function() {
    const baseurl = 'abc';
    let uploader = WebUploader.create({
        //选择完文件或是否自动上传
        auto: false,
        //swf文件路径
        swf: './Uploader.swf',
        //是否要分片处理大文件上传。
        chunked: false,
        // 如果要分片，分多大一片？ 默认大小为5M.
        chunkSize: 5 * 1024 * 1024,
        // 上传并发数。允许同时最大上传进程数[默认值：3]   即上传文件数
        threads: 1,
        //文件接收服务端
        server: baseurl + "file/saveTemplate",
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#choose-File',
        method: "POST",
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false
            // formData: {
            //     course: ucourse,
            //     task: utask
            // }
    });
})