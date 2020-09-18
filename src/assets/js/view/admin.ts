//css
import '../../sass/modules/admin.scss'

//js

import '../common/app'

import { stringEncode, baseAddress, getRandomStr, getQiNiuUploadToken, downLoadByUrl } from '../common/utils'
import fileApi from '../apis/file.js'
import { amModal } from '@/lib/utils'
import jqUtils from '@/lib/jqUtils'
import { childContentApi, fileApi2, reportApi, peopleApi, courseApi } from 'apis/index'

$(function () {
    const baseUrl = "/EasyPicker/";
    const username = localStorage.getItem("username") as string;
    let reports: Report[]; //存放所有文件信息
    let nodes: any[]; //存放所有类别信息(子类/父类)
    const token = localStorage.getItem("token");
    let filterFlag: string = ''; //记录过滤的表名
    //tempTest
    let nowClickId: string | undefined = '';
    //设置全局ajax设置
    $.ajaxSetup({
        // 默认添加请求头
        headers: {
            "token": token
        },
        error: function () {
            amModal.alert("网络错误");
        }
    });
    //初始化用户名
    setUsername(username);

    /**
     * 设置用户名
     * @param username
     */
    function setUsername(username) {
        $('.username').html(username);
    }

    /**
     * 创建datatable对象
     * @param domId 标签id
     * @param options 自定义配置项
     */
    function createDataTable(domId, options = {}) {
        return $(`#${domId}`).DataTable({
            responsive: true, //是否是响应式？
            pageLength: 10, //每页条数
            dom: 'rt<"bottom"p><"clear">',
            order: [
                [0, 'asc']
            ], //初始化排序是以那一列进行排序，并且，是通过什么方式来排序的，下标从0开始，‘’asc表示的是升序，desc是降序
            ...options
        });
    }


    /*--------------初始化DataTable组件------------------*/
    //文件管理
    const filesTable = createDataTable('filesTable');

    //人员管理
    const peopleListTable = createDataTable('peopleListTable', {
        pageLength: 8
    });

    //过滤器
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            //当前选择父类名称
            const courseName = $("#courseList").children(":selected").text();
            //当前选择的子类名称
            const taskName = $("#taskList").children(":selected").text();
            const handleFilter = {
                //人员名单列表过滤
                people() {
                    const value = $('#peopleFilter').val();
                    if (value == -1) {
                        return true;
                    } else {
                        const type = value == 1 ? "已提交" : "未提交";
                        return data[2] == type;
                    }
                },
                //父类
                parentType() {
                    if (courseName === "全部") {
                        return true;
                    } else {
                        return data[2] === courseName;
                    }
                },
                //子类
                childrenType() {
                    if (taskName === "全部" && courseName === "全部") {
                        return true;
                    } else if (taskName === "全部") {
                        return data[2] === courseName;
                    } else {
                        return taskName === data[3] && data[2] === courseName;
                    }
                }
            };
            return filterFlag ? handleFilter[filterFlag]() : true;
        }
    );

    class Request {
        private baseUrl: string
        constructor() {
            this.baseUrl = "/EasyPicker/";
        }

        base(url, method, data, options = {}) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: this.baseUrl + url,
                    type: method,
                    headers: {
                        "token": token,
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    data: JSON.stringify(data),
                    ...options,
                    success: res => {
                        resolve(res);
                    },
                    error: err => {
                        reject(err);
                    }
                })
            })
        }
        put(url, data, options = {}) {
            return this.base(url, "PUT", data, options);
        }
        delete(url, data, options = {}) {
            return this.base(url, "DELETE", data, options);
        }
        post(url, data, options = {}) {
            return this.base(url, "POST", data, options);
        }

        get() {

        }
    }

    const http = new Request();

    //初始化时间选择时间控件
    $("#datePicker").ECalendar({
        type: "time",
        stamp: true, //回调函数value值格式 单位为秒
        skin: 5,
        format: "yyyy-mm-dd hh:ii:00",
        callback: function (v) {
            $("#datePicker").attr("readonly", "readonly");
            let newDate = v * 1000;
            //绑定设置时间按钮事件
            $('#sure-Date').unbind('click')
            $('#sure-Date').on('click', function () {
                if (nowClickId) {
                    childContentApi.update(nowClickId, 1, {
                        ddl: newDate
                    }).then(({ code }) => {
                        if (code === 200) {
                            amModal.alert(`截止日期已设置为:${new Date(newDate).Format("yyyy-MM-dd hh:mm:ss")}`);
                            jqUtils.unFreezeBtn($('#cancel-Date'))
                        }
                    })
                }
            })
        }
    });


    //=================================华丽的分割线(上传文件模板)
    interface TempFile {
        status: number,
        file: File,
        id: string
    }
    /**
     * 上传模板文件
     */
    let templateFile: TempFile | any;
    /**
     * 选择模板文件
     */
    $<HTMLInputElement>('#choose-file input').on('change', function (e) {
        const files = e?.target?.files
        if (files) {
            const file = files[0]
            if (file.name.indexOf(".") === -1 || file.name.indexOf(".") === file.name.length - 1) {
                amModal.alert("文件必须有后缀", "文件名称不支持")
                return
            }
            templateFile = {
                status: 0, // -1 0 1 2|失败 待上传 上传成功 上传中
                file,
                id: getRandomStr(7)
            }
            let dom = `<li class="file-item" id="${templateFile.id}">
                        <h4 class="am-margin-bottom-sm">${file.name}</h4>
                            <div class="am-progress am-progress-striped am-active" style="height:2rem;">
                                <div status="${templateFile.status}" class="progress am-progress-bar am-progress-bar-secondary" style="width: 100%">
                                    等待上传。。。
                                </div>
                            </div>
                        </li>`;

            $('#fileList').empty().append(dom);
        }
    })

    // 开始上传
    $('#sure-Template').on('click', function () {
        const { file, status, id } = templateFile
        const fileItem = $(`#${id}`)
        const process = fileItem.find(".progress")[0]
        const $btn = $(this)
        if (status !== 1 && status !== 2) {
            getQiNiuUploadToken().then(res => {
                $btn.button("loading");
                const ucourse = document.getElementById('courseActive')?.textContent;
                const utask = document.getElementById('taskActive')?.textContent + '_Template';
                let key = `${username}/${ucourse}/${utask}/${file.name}`
                const observable = qiniu.upload(file, key, res.data.data)
                templateFile.status = 2
                const subscription = observable.subscribe({
                    next(res) {
                        const { total: { percent } } = res
                        const width = percent.toFixed(2) + '%'
                        process.style.width = width
                        process.textContent = width
                    },
                    error(err) {
                        templateFile.status = -1
                        process.textContent = "上传失败"
                        process.classList.replace('am-progress-bar-secondary', 'am-progress-bar-danger')
                        amModal.alert(JSON.stringify(err));
                        $btn.button('reset')
                    },
                    complete(res) {
                        $btn.button('reset')
                        templateFile.status = 1
                        const { hash, key } = res
                        process.textContent = "上传成功"
                        process.classList.replace('am-progress-bar-secondary', 'am-progress-bar-success')
                        nowClickId && childContentApi.update(nowClickId, 3, {
                            template: file.name
                        }).then(res => {
                            if (res.code === 200) {
                                amModal.alert("模板已设置成功:" + file.name);
                                jqUtils.unFreezeBtn($('#cancel-Template'))
                                //启用删除模板按钮
                                const docFrag = document.createDocumentFragment();
                                const fileList = document.getElementById('fileList');
                                //移除原来子节点
                                clearpanel('#fileList');
                                //创建新的节点并插入原文档
                                const div = document.createElement('div');
                                div.textContent = file.name;
                                docFrag.appendChild(div);
                                fileList?.appendChild(docFrag);
                            }
                        })
                    }
                })
                // subscription.close() // 取消上传  
            })
        } else {
            amModal.alert("没有可上传的文件")
        }
    });
    //=========================================华丽的分割线(上传人员名单部分)=========================================
    /**
     * 上传人员限制名单文件
     */
    let peoplePicker = WebUploader.create({
        auto: false,
        swf: 'https://img.cdn.sugarat.top/webuploader/0.1.1/Uploader.swf',
        threads: 1,
        server: baseUrl + "file/people",
        pick: '#filePicker',
        method: "POST",
        resize: false
    });
    // 当有文件被添加进队列的时候
    peoplePicker.on('fileQueued', function (file) {
        peoplePicker.options.formData = {}
        const fileList = document.getElementById('peopleFileList');
        const docFrag = document.createDocumentFragment();
        const outerDiv = document.createElement('div');
        outerDiv.id = file.id;
        const p = document.createElement('p');
        const span = document.createElement('span');
        span.classList.add(...("fw-c-fff am-badge am-badge-primary".split(' ')));
        span.textContent = '等待上传';
        const innerDiv = document.createElement('div');
        innerDiv.textContent = file.name;
        p.appendChild(span);
        outerDiv.append(p, innerDiv);
        docFrag.append(outerDiv);
        fileList?.append(docFrag);
    });
    // 文件上传过程中
    peoplePicker.on('uploadProgress', function (file, percentage) {
        const fileDom = document.getElementById(file.id)
        if (fileDom) {
            const span = fileDom?.querySelector('span')
            if (span) {
                span.textContent = `上传中:${percentage.toFixed(2) * 100}`;
            }
        }
    });

    // 文件上传成功处理。
    peoplePicker.on('uploadSuccess', function (file, response) {
        const fileDom = document.getElementById(file.id)
        if (fileDom) {
            const span = fileDom?.querySelector('span')
            if (span) {
                span.classList.replace("am-badge-primary", "am-badge-success");
                span.textContent = "上传成功";
                const { code } = response;
                if (code === 200) {
                    const { failCount } = response.data;
                    if (failCount > 0) {
                        amModal.alert(`有${failCount}条数据未导入成功`);
                        // 自动下载未导入成功数据文件
                        let tempData = peoplePicker.options.formData;
                        let filename = file.name;
                        filename = filename.substring(0, filename.lastIndexOf(".")) + "_fail.xls";
                        let jsonArray: any[] = [];
                        jsonArray.push({ "key": "course", "value": tempData.parent });
                        jsonArray.push({ "key": "tasks", "value": tempData.child + "_peopleFile" });
                        jsonArray.push({ "key": "username", "value": tempData.username });
                        jsonArray.push({ "key": "filename", "value": filename });
                        downloadFile(baseUrl + "file/down", jsonArray);
                    } else {
                        amModal.alert("全部导入成功");
                    }
                } else {
                    span.classList.replace("am-badge-success", "am-badge-warning");
                    span.textContent = "不支持的文件类型";
                    amModal.alert("文件格式不符合要求,目前只支持.txt,.xls,.xlsx等文件类型");
                }
            }
        }

    });

    //上传出错
    peoplePicker.on('uploadError', function (file) {
        const span = document.getElementById(file.id)?.querySelector('span');
        span?.classList.replace("am-badge-primary", "am-badge-danger");
        if (span) {
            span.textContent = "上传出错";
        }
    });

    // 开始上传
    $('#uploadPeople').on('click', function () {
        let { formData } = peoplePicker.options;
        formData.parent = document.getElementById('courseActive')?.textContent;
        formData.child = document.getElementById('taskActive')?.textContent;
        formData.username = username;
        peoplePicker.upload();
    });


    //=========================================华丽分割线=============================================
    //页面初始化
    Init();


    //========================================复制粘贴=====================================
    /**
    * 将结果写入的剪贴板
    * @param {String} text 
    */
    function copyRes(text) {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.setAttribute('value', text);
        input.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        document.body.removeChild(input);
        amModal.alert("结果已成功复制到剪贴板")
    }
    $('#copyLink').on('click', function (e) {
        const a = document.getElementById('tempCopy') as HTMLLinkElement
        copyRes(a?.href)
    })

    /**
     * 调用第三方接口短地址生成  https://www.ft12.com/
     */
    $('#createShortLink').on('click', function () {
        let originUrl = document.getElementById('tempCopy')?.getAttribute('href');
        getShortUrl(originUrl);
    });

    function checkOssStatus(url) {
        $('#download').button('loading')
        fileApi.getcompressFileStatus(url).then(res => {
            const { code } = res.data
            if (code === 0) {
                const { key } = res.data
                // 获取下载链接
                fileApi.getFileDownloadUrl(...key.split('/')).then(res => {
                    const { url } = res.data
                    // 开始下载
                    downLoadByUrl(url)
                    // 恢复下载按钮
                    $('#download').button('reset')
                })
                return
            }
            // 为完成继续论询
            setTimeout(checkOssStatus, 1000, url)
        })
    }
    /**
     * 下载指定任务中所有文件
     */
    $('#download').on('click', function () {
        const parentEL = document.getElementById('courseList') as HTMLSelectElement
        const childEl = document.getElementById('taskList') as HTMLSelectElement
        let parent = parentEL?.value
        let child = childEl?.value;
        if (parent === '-1' || child === '-1') {
            amModal.alert("请选择要下载的子类");
            return 0;
        }
        //取得子类与父类的名称
        parent = nodes.find(function (v) {
            return v.id === Number.parseInt(parent);
        }).name;

        child = nodes.find(function (v) {
            return v.id === Number.parseInt(child);
        }).name;

        //查找是否有符合条件的文件
        let findResult = reports.find(function (v) {
            return v.course === parent && v.tasks === child;
        });
        if (!findResult) {
            amModal.alert("没有可下载的文件");
        } else {
            //防止用户点击多次下载
            let $btn = $(this);
            $btn.button('loading');
            fileApi.checkFileCount(username, parent, child).then(res => {
                const { oss, server } = res.data
                if (server !== 0) {
                    //生成指定任务的压缩包 并下载
                    fileApi2.createZip(parent, child, username).then(({ code }) => {
                        if (code === 200) {
                            // 开始下载压缩文件文件
                            let jsonArray: any[] = [];
                            jsonArray.push({ "key": "course", "value": parent });
                            jsonArray.push({ "key": "tasks", "value": "." });
                            jsonArray.push({ "key": "username", "value": username });
                            jsonArray.push({ "key": "filename", "value": child + ".zip" });
                            downloadFile(baseUrl + "file/down", jsonArray);
                            setTimeout(function () {
                                $btn.button('reset');
                            }, 2000);
                        }
                    }).catch(err => {
                        setTimeout(function () {
                            $btn.button('reset');
                        }, 1000);
                    })
                }

                if (oss !== 0) {
                    fileApi.compressOssFile(username, parent, child).then(res => {
                        const { url } = res.data
                        checkOssStatus(url)
                    })
                    // TODO
                    // checkOssStatus('http://api.qiniu.com/status/get/prefop?id=z2.01z201c4an8eqp5fww00muo2j400016f')
                }

                if (oss === 0 && server === 0) {
                    amModal.alert('由于服务器迁移,老版平台上传的文件已经被清理', '源文件已经被删除')
                    setTimeout(function () {
                        $btn.button('reset');
                    }, 1000);
                }
            })
        }
    })

    /**
     * 异步刷新文件列表的数据
     */
    $('#refreshData').on('click', function () {
        let $btn = $(this);
        $btn.button('loading');
        //刷新文件面板数据
        getReportsData(username);

        //5秒钟后才可进行下次刷新
        setTimeout(function () {
            $btn.button("reset");
        }, 5000);
    });
    /**
     * 搜索table中的内容
     */
    $('#searchVal').on('click', function () {
        const val = $(this).parent().prev().val() as string
        filesTable.search(val || ' ').draw();
    });

    /**
     * 搜索人员名单中的内容
     */
    $('#searchPeople').on('click', function () {
        const val = $(this).parent().prev().val() as string
        peopleListTable.search(val || ' ').draw();
    });

    /**
     * 状态过滤器发生改变
     */
    $("#peopleFilter").on('change', function () {
        filterFlag = "people";
        peopleListTable.draw();
    });

    /**
     * 切换面板
     */
    $('#navMenu').on('click', 'li.sidebar-nav-link', function () {
        let key = this.getAttribute('key');
        // 面板切换
        Array.from<HTMLDivElement>(document.getElementsByClassName('tpl-content-wrapper') as HTMLCollectionOf<HTMLDivElement>).forEach(function (e) {
            e.style.display = 'none';
        });
        const panelEL = document.getElementById(`panel-${key}`)
        if (panelEL) {
            panelEL.style.display = 'block';
        }

        //侧边导航栏样式切换
        $('#navMenu').find('a').removeClass('active');
        $(this).find('a').addClass('active');

        // $('.tpl-header-switch-button').click();
    });

    /**
     * 下载指定实验报告
     */
    $('#filesTable').on('click', '.download', function () {
        let cells = filesTable.row($(this).parents('tr')).data();
        let jsonArray: any = [];
        jsonArray.push({ "key": "course", "value": cells[2] });
        jsonArray.push({ "key": "tasks", "value": cells[3] });
        jsonArray.push({ "key": "filename", "value": cells[4] });
        jsonArray.push({ "key": "username", "value": username });
        fileApi.checkFileIsExist(username, cells[2], cells[3], cells[4]).then(res => {
            const { where } = res.data
            if (where === 'server') {
                downloadFile(baseUrl + "file/down", jsonArray);
            } else if (where === 'oss') {
                fileApi.getFileDownloadUrl(username, cells[2], cells[3], cells[4]).then(res => {
                    const { url } = res.data
                    downLoadByUrl(url)
                })
            } else {
                amModal.alert('由于服务器迁移,老版平台上传的文件已经被清理', '源文件已经被删除')
            }
        })
    })

    /**
     * 删除指定实验报告
     */
    $('#filesTable').on('click', '.delete', function () {
        if (confirm("确认删除此文件,删除后将无法复原,请谨慎操作?")) {
            let cells = filesTable.row($(this).parents('tr')).data();
            let that = this;
            // TODO: 待完善axios的delete传参
            $.ajax({
                url: baseUrl + "report/report",
                type: "DELETE",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify({
                    "id": cells[0]
                }),
                success: function (res) {
                    if (res.code === 200) {
                        filesTable.row($(that).parents("tr")).remove();
                        filesTable.draw()
                        amModal.alert("删除成功！")
                        //异步获取最新的repors数据
                        reportApi.getReports(username).then(res => {
                            if (res.code === 200) {
                                reports = res.data.reportList
                            }
                        })
                    }

                }
            })
        }
    });


    //华丽的分割线--------------------------------------
    //类目区域

    /***
     * 导航条切换子类管理面板
     */
    $('#settings-tool').on('click', 'button', function (e) {
        let target = this.getAttribute('target');
        let parentElement = this.parentElement;
        while (parentElement.nextElementSibling) {
            parentElement = parentElement.nextElementSibling;
            if (parentElement.getAttribute('Tab') === target)
                parentElement.style.display = 'block';
            else
                parentElement.style.display = 'none';
        }
        // $(this).parent().siblings().hide();
        //  this.parentElement.parentElement.querySelector(`div[Tab="${target}"]`).style.display='block';
        // $(this).parent().siblings('div[Tab="'+target+'"]').show();
    });

    /**
     * 移除当前设置的模板
     */
    $("#cancel-Template").on('click', function (e) {
        if (confirm("确定移除当前设置的文件模板吗?")) {
            childContentApi.update(nowClickId as string, 3, {
                template: null
            }).then(res => {
                if (res.code === 200) {
                    amModal.alert("已移除当前设置的文件模板");
                    //清理设置的模板
                    $("#fileList").empty();
                    //禁用关闭按钮
                    jqUtils.freezeBtn($('#cancel-Template'))
                }
            })
        }
    })

    /**
     * 关闭截止日期设定
     */
    $('#cancel-Date').on('click', function (e) {
        if (confirm("确定关闭截止日期吗?")) {
            childContentApi.update(nowClickId as string, 1, {
                ddl: null
            }).then(res => {
                if (res.code === 200) {
                    amModal.alert("已取消截止日期设置");
                    //清理设置的日期内容
                    const datePicker = document.querySelector<HTMLInputElement>('#datePicker');
                    if (datePicker) {
                        datePicker.value = "";
                        datePicker.placeholder = '点击设置截止日期';
                    }
                    //禁用取消设置按钮
                    jqUtils.freezeBtn($('#cancel-Date'))
                    //解绑确定设置事件
                    $("#sure-Date").unbind('click');
                }
            })
        }
    });


    /**
     *  关闭人员限制
     */
    $('#closePeople').on('click', function () {
        const $btn = $(this)
        childContentApi.update(nowClickId as string, 2, {
            people: null
        }).then(res => {
            if (res.code === 200) {
                //禁用当前按钮,启用打开按钮
                jqUtils.freezeBtn($btn)
                jqUtils.unFreezeBtn($btn.next())
                //隐藏面板
                const panelEL = document.querySelector<HTMLDivElement>('#showPeople')
                if (panelEL) {
                    panelEL.style.display = 'none';
                }
            }
        })
    });


    /**
     *  打开人员限制
     */
    $('#openPeople').on('click', function () {
        const $btn = $(this)
        childContentApi.update(nowClickId as string, 2, {
            people: 'true'
        }).then(res => {
            if (res.code === 200) {
                //禁用当前按钮,启用打开按钮
                jqUtils.freezeBtn($btn)
                jqUtils.unFreezeBtn($btn.prev())
                const panelEl = document.querySelector<HTMLDivElement>('#showPeople')
                if (panelEl) {
                    //隐藏面板
                    panelEl.style.display = 'flex';
                }
            }
        })
    })

    /**
     * 查看名单详细提交情况
     */
    $('#checkPeopleModal').on('click', function () {
        const parent = $("#courseActive").html() as string
        const child = $('#taskActive').html() as string

        peopleApi.getList(parent, child, username).then(res => {
            if (res.code === 200) {
                const { data } = res;
                //清空原有数据
                peopleListTable.rows().remove().draw();
                //记录未提交人数
                let no_submit = 0;
                //加载最新数据
                for (let i = 0; i < data.length; i++) {
                    const d = data[i]
                    const btn = document.createElement('div');
                    const a = document.createElement('a');
                    const $i = document.createElement('i');
                    btn.classList.add('tpl-table-black-operation');
                    a.setAttribute("people-key", d.id + '');
                    a.classList.add('delete', 'tpl-table-black-operation-del', 'am-margin-sm');
                    a.href = 'javascript:void(0)';
                    $i.classList.add('am-icon-trash');
                    a.append($i, "删除");
                    btn.append(a);
                    const date = d.date ? new Date(d.date).Format("yyyy-MM-dd hh:mm:ss") : "暂无记录";

                    if (!d.status)
                        no_submit++;

                    peopleListTable.row.add([
                        i + 1,
                        d.name,
                        GetState(d.status),
                        date,
                        btn.outerHTML
                    ])

                }
                peopleListTable.draw();
                $('#amountPeople').text(data.length);
                $('#noSubmit').text(no_submit);
            }
        })
        openModel("#people-modal", false);

    });

    /**
     * 移除指定人员
     */
    $('#peopleListTable').on('click', '.delete', function (e) {
        if (!confirm("确认删除?")) {
            return;
        }
        const id = e.currentTarget.getAttribute("people-key");
        const that = this;
        $.ajax({
            url: baseUrl + "people/people",
            type: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            data: JSON.stringify({
                id
            })
        }).then(res => {
            if (res.code === 200) {
                peopleListTable.row($(that).parents("tr")).remove();
                peopleListTable.draw()
            }
        })
    })

    /**
     * 打开子类附加功能设置面板
     */
    $("#taskPanel").on('click', '.settings', function (event) {
        //显示当前操作的子类
        $(this).prev().prev().click();
        const taskid = $(this).parents('li').attr("value");
        nowClickId = taskid;
        // openModel("#settings-panel",false);
        resetModalPanel();
        childContentApi.getInitData(taskid as string).then(res => {
            const { code, data } = res;
            if (code === 200) {
                const $datePicker = $('#datePicker')
                const $cancelDate = $('#cancel-Date')
                //加载ddl
                if (data.ddl) {
                    const newDate = new Date(data.ddl);
                    jqUtils.unFreezeBtn($cancelDate)
                    $datePicker.attr('data-ec', newDate.toString())
                    $datePicker.val(newDate.Format("yyyy-MM-dd hh:mm:ss"))
                } else {
                    jqUtils.freezeBtn($cancelDate)
                    $datePicker.attr('placeholder', "点击设置截止日期")
                    $datePicker.val('')
                }
                //    加载Template
                const $fileList = $('#fileList');
                const $cancelTemplate = $('#cancel-Template');
                if (data.template) {
                    clearpanel('#fileList');
                    jqUtils.unFreezeBtn($cancelTemplate)
                    const div = document.createElement('div');
                    div.textContent = data.template;
                    $fileList.append(div);
                } else {
                    jqUtils.freezeBtn($cancelTemplate)
                }

                //如果设置限制了提交者
                const $showPeople = $('#showPeople');
                const $openPeople = $('#openPeople');
                const $closePeople = $('#closePeople');
                if (data.people) {
                    $showPeople.show()
                    jqUtils.freezeBtn($openPeople)
                    jqUtils.unFreezeBtn($closePeople)
                } else {
                    $showPeople.hide()
                    jqUtils.unFreezeBtn($openPeople)
                    jqUtils.freezeBtn($closePeople)
                }
            } else {
                resetModalPanel();
            }
            //如果有数据

            openModel("#settings-panel", false);
        })
        event.stopPropagation();
    });

    /**
     *  展开父类的属性
     */
    $("#coursePanel,#taskPanel").on('click', '.show-hide', function () {
        const className = $(this).attr("class");
        if (className) {
            let isShow = className.includes("arrow-right");
            if (isShow) {
                Array.from($(this).siblings(".am-hide")).forEach(btn => {
                    $(btn).removeClass('am-hide');
                    $(btn).addClass('am-show');
                });
                $(this).attr("class", className.replace("arrow-right", "arrow-left"));
            } else {
                Array.from($(this).siblings(".am-show")).forEach(btn => {
                    $(btn).addClass('am-hide');
                    $(btn).removeClass('am-show');
                });
                $(this).attr("class", className.replace("arrow-left", "arrow-right"));
            }
        }
    });
    /**
     * 删除课程
     */
    $("#coursePanel").on('click', '.delete', function (event) {
        const parentElement = this.parentElement.parentElement;
        let id = parentElement.value;
        if (confirm("确认删除此课程吗,删除课程将会移除课程相关的子任务?")) {
            delCourseOrTask(1, id).then(res => {
                const { code } = res;
                if (code === 200) {
                    const { data: { status } } = res;
                    if (status) {
                        parentElement.remove();
                        clearpanel('#taskPanel');
                        $('#taskPanel').prev().show()
                        $('#addTask').unbind('click');
                        const coursePanel = $('#coursePanel');
                        if (coursePanel.children().length === 0) {
                            coursePanel.show()
                        }
                    }
                    return;
                }
                amModal.alert("删除失败" + res.errMsg);
            });
        }
        event.stopPropagation();
    });

    /**
     * 删除任务
     */
    $("#taskPanel").on('click', '.delete', function (event) {
        const parentElement = this.parentElement.parentElement;
        let id = parentElement.value;
        if (confirm("确认删除此任务吗?")) {
            delCourseOrTask(0, id).then(res => {
                const { code } = res;
                if (code === 200) {
                    const { data: { status } } = res;
                    if (status) {
                        parentElement.remove();
                        const taskPanel = $('#taskPanel');
                        if (taskPanel.children().length === 0) {
                            taskPanel.show()
                        }
                    }
                    return;
                }
                amModal.alert("删除失败" + res.errMsg);
            });

        }
        event.stopPropagation();
    });


    /**
     * 生成任务/子类分享链接
     */
    $('#taskPanel').on('click', 'button.share', function () {
        let parent = document.getElementById('courseActive')?.textContent;
        let child = this.previousElementSibling.textContent;
        let key = btoa(encodeURI(`username=${username}&parent=${parent}&child=${child}`))
        let shareUrl = `${baseAddress}/upload?${key}`;
        setCopyContent(shareUrl);
        openModel("#copy-panel");
    });

    /**
     * 生成课程/父类分享链接
     */
    $('#coursePanel').on('click', 'button.share', function () {
        let parent = this.previousElementSibling.textContent;
        let key = btoa(encodeURI(`username=${username}&parent=${parent}`))
        let shareUrl = `${baseAddress}/upload?${key}`;
        setCopyContent(shareUrl);
        openModel("#copy-panel");
    });

    /**
     * 显示当前点击了的子类
     */
    $('#taskPanel').on('click', 'button.checkChildren', function () {
        $('#taskActive').text(this.textContent);
    });
    /**
     * 查看子类/选择课程
     */
    $('#coursePanel').on('click', '.checkChildren', function () {
        $('#courseActive').text(this.textContent)
        let parentsId = this.parentElement.parentElement.value;
        setdataPanel('children', parentsId, username);
        //增加任务
        $('#addTask').unbind('click');
        $('#addTask').on('click', function (e) {
            let $input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
            let value = $input?.value.trim();
            value = stringEncode(value)
            if (!value) {
                amModal.alert('内容不能为空');
                return;
            }

            const $taskPanel = $('#taskPanel');
            const $lis = Array.from($taskPanel?.children());
            const isExist = !!$lis.find((el) => {
                return el.getAttribute('text') === value;
            });
            if (isExist) {
                amModal.alert("内容已存在");
                $input.value = "";
                return;
            }

            addCourseOrTask(value, 0, parentsId, username);
            $taskPanel.prev().hide()
        })
    });

    /**
     * 添加课程
     */
    $('#addCourse').on('click', function () {
        let $input = this.parentElement?.previousElementSibling as HTMLInputElement;
        let value = $input?.value?.trim();
        if (!value) {
            amModal.alert('内容不能为空');
            return;
        }
        value = stringEncode(value)
        const $coursePanel = $('#coursePanel');
        const $lis = Array.from($coursePanel.children());
        const isExist = !!$lis.find((e) => {
            return e.getAttribute('text') === value;
        });
        if (isExist) {
            amModal.alert("内容已存在");
            $input.value = "";
            return;
        }

        addCourseOrTask(value, 1, null, username);
        $coursePanel.prev().hide();
    });

    /**
     * 退出登录
     */
    $('#logout').on('click', function () {
        if (confirm("确认注销账户吗?")) {
            logout();
        }
    });

    /**
     * 返回个人状态信息的div
     * @param state 1/0
     * @return {String} div.outerHtml
     */
    function GetState(state) {
        let str_state = "未知";
        let color = '#f35842';
        let temp = document.createElement('div');
        const stateMap = new Map([
            [1, { color: "#5eb95e", text: '已提交' }],
            [0, { color: "#f35842", text: '未提交' }]
        ]);
        if (stateMap.has(state)) {
            str_state = stateMap.get(state)?.text as string;
            color = stateMap.get(state)?.color as string;
        }
        temp.style.color = color;
        temp.setAttribute('state', state);
        temp.textContent = str_state;
        return temp.outerHTML;
    }


    /**
     * 初始化面板内容
     */
    function resetModalPanel() {
        templateFile = null
        //    默认datePicker
        $('#datePicker').val('')
        jqUtils.freezeBtn($('#cancel-Date'))

        //清空fileList
        clearpanel("#fileList");
        jqUtils.freezeBtn($('#cancel-Template'))
        jqUtils.unFreezeBtn($('#showPeople'))
        // 重置filePicker
        peoplePicker.reset();
        //清空peopleFileList
        clearpanel('#peopleFileList')

        // 重置peopleListModal
        $('#peopleFilter').selected("destroy");
        $('#peopleFilter').val(["-1"]);
        $("#peopleFilter").selected({
            btnSize: 'sm',
            btnStyle: 'primary'
        })
    }

    /**
     * 设置Copy的内容
     */
    function setCopyContent(shareUrl) {
        const tempCopy = document.getElementById('tempCopy');
        if (tempCopy) {
            tempCopy.setAttribute('href', shareUrl);
            tempCopy.textContent = shareUrl;
        }
    }


    function jsonp(url: string, jsonpCallback: string, success) {
        const $script = document.createElement('script')
        $script.src = url + `&callback=${jsonpCallback}`
        $script.async = true
        $script.type = 'text/javascript'
        window[jsonpCallback] = function (data) {
            success && success(data)
        }
        document.body.appendChild($script)
    }
    /**
     * 生成短地址
     * @param url
     */
    function getShortUrl(url) {
        url = 'http://ep.sugarat.top/upload?dXNlcm5hbWU9YWRtaW4mcGFyZW50PUMjJUU2JUExJThDJUU5JTlEJUEyJUU1JUJBJTk0JUU3JTk0JUE4'
        jsonp(`https://api.ft12.com/api.php?format=jsonp&url=${url}&apikey=15196520474@811a2f8e6e0f2424975993679ac041c5`, 'shortLink', function (res) {
            const tempCopy = document.getElementById('tempCopy');
            if (tempCopy) {
                tempCopy.setAttribute('href', res.url);
                tempCopy.textContent = res.url;
            }
        })
    }

    /**
     * 打开指定弹出层
     * @param {String} id 弹出层id
     * @param {boolean} close 设置点击遮罩层是否可以关闭
     */
    function openModel(id, close = true) {
        $(id).modal({
            closeViaDimmer: close //设置点击遮罩层无法关闭
        });
        $(id).modal('open');
    }

    /**
     * 退出登录
     */
    function logout() {
        localStorage.removeItem('token')
        redirectHome();
    }

    /**
     * 添加课程或者任务
     * @param name 名称
     * @param type  1 课程  0 任务
     * @param parent -1表示添加课程
     */
    function addCourseOrTask(name, type, parent, username) {
        $.ajax({
            url: baseUrl + 'course/add',
            contentType: "application/json",
            type: 'PUT',
            data: JSON.stringify({
                "name": name,
                "type": type,
                "parent": parent,
                "username": username
            }),
            success: function (res) {
                if (res.code !== 200) {
                    amModal.alert('添加失败');
                    return;
                }

                if (!res.data.status) {
                    amModal.alert('内容已存在');
                } else if (!parent) {
                    insertToPanel("#coursePanel", name, res.data.id, 'course');
                } else {
                    insertToPanel("#taskPanel", name, res.data.id, 'task');
                }
            }
        })
    }

    /**
     * 删除课程/任务
     * @param type 课程/任务
     * @param id 待删除的id
     */
    function delCourseOrTask(type, id) {
        return new Promise<BaseResponse>(resolve => {
            $.ajax({
                url: baseUrl + 'course/del',
                contentType: "application/json",
                headers: {
                    "token": token
                },
                type: 'DELETE',
                data: JSON.stringify({
                    "id": id,
                    "type": type
                }),
                success: function (res) {
                    resolve(res);
                }
            })
        });

    }

    /**
     * 设置管理面板数据
     * @param range
     * @param parentid
     */
    function setdataPanel(range: string, parentid: number, username: string) {
        courseApi.getCourseList(range, parentid, username).then(res => {
            const { code, data: { courseList } } = res;
            if (code === 200 && !courseList.length) {
                if (range === 'parents') {
                    clearpanel('#coursePanel');
                    $('#coursePanel').prev().show()
                } else {
                    clearpanel("#taskPanel");
                }
                $('#taskPanel').prev().show()
                return;
            }
            if (range === 'parents') {
                $('#coursePanel').prev().hide();
                clearpanel('#coursePanel');
                courseList.forEach(v => {
                    insertToPanel("#coursePanel", v.name, v.id, 'course');
                });
            } else if (range === 'children') {
                $('#taskPanel').prev().hide();
                clearpanel("#taskPanel");
                courseList.forEach(v => {
                    insertToPanel("#taskPanel", v.name, v.id, 'task');
                });
            }
        })
    }

    /**
     * 向管理面板插入数据
     * @param panelid
     * @param value
     * @param id
     * @param type 判断是任务还是课程 task/course
     */
    function insertToPanel(panelid, value, id, type) {
        let $li = '';
        switch (type) {
            case "task":
                $li =
                    '<li class="am-margin-top-sm"text="' + value + '"value="' + id + '">' +
                    '<div class="am-btn-group am-btn-group-sm">' +
                    '<button  type="button"  class="checkChildren am-btn am-btn-secondary am-round">' + value + '</button>' +
                    '<button title="生成子类文件收取链接" type="button"  class="am-hide share am-btn am-btn-secondary am-round am-icon-share-alt"></button>' +
                    '<button  type="button"  class="am-hide settings am-btn am-btn-secondary am-round am-icon-server"></button>' +
                    '<button type = "button" class="am-hide delete am-btn am-btn-secondary am-round am-icon-trash" ></button > ' +
                    '<button title="展开" type="button"  class="show-hide am-btn am-btn-secondary am-round am-icon-arrow-right"></button></div > </li >';
                break;
            case "course":
                $li =
                    '<li class="am-margin-top-sm"text="' + value + '"value="' + id + '">' +
                    '<div class="am-btn-group am-btn-group-sm">' +
                    '<button title="查看子类任务" type="button"  class="checkChildren am-btn am-btn-success am-round">' + value + '</button>' +
                    '<button title="生成父类文件收取链接" type="button"  class="am-hide share am-btn am-btn-success am-round am-icon-share-alt"></button>' +
                    '<button title="删除" type = "button" class="am-hide delete am-btn am-btn-success am-round am-icon-trash" ></button > ' +
                    '<button title="展开" type="button"  class="show-hide am-btn am-btn-success am-round am-icon-arrow-right"></button></div > </li >';
                break;
            default:
                break;
        }
        $(panelid).append($li);
    }


    /**
     * 重定向到首页
     */
    function redirectHome() {
        window.location.href = "/"
    }

    /**
     * 清空管理面板数据
     * @param {String} selectid
     */
    function clearpanel(panelid) {
        $(panelid).empty()
    }

    /**
     * 页面初始化填充数据
     */
    function Init() {
        //判断登录是否失效
        let token = localStorage.getItem("token");
        if (token == null || token == '') {
            amModal.alert("登录已经失效,请重新登录");
            redirectHome();
            return;
        }
        clearpanel('#coursePanel');
        clearpanel('#taskPanel');

        setdataPanel("parents", -1, username);

        //加载文件面板数据
        getReportsData(username);

        //加载文件面板下拉选框数据
        initSelectData();

    }

    /**
     * 通过用户名查询所有提交的任务的信息
     * @param username
     */
    function getReportsData(username) {
        //移除原来的数据
        filesTable.rows().remove().draw();

        setTimeout(() => {
            $.ajax({
                url: baseUrl + 'report/report' + `?time=${Date.now()}`,
                type: "GET",
                data: {
                    "username": username
                }
            }).then(res => {
                const { code } = res
                if (code === 200) {
                    ({ reportList: reports } = res.data);
                    reports.forEach(function (key) {
                        addDataToFilesTable(key.id, key.name, key.course, key.tasks, key.filename, key.date);
                    });
                    filesTable.rows().draw();
                    refreshPageInfo();
                } else {
                    localStorage.removeItem('token')
                    amModal.alert('登录过期')
                    redirectHome()
                }
            })
        }, 0);

    }

    /**
     * 向文件列表中添加数据
     * @param {Number} id
     * @param {String} name
     * @param {String} course
     * @param {String} task
     * @param {String} filename
     * @param {String} date
     */
    function addDataToFilesTable(id, name, course, task, filename, date) {
        let $btns = '<div class="tpl-table-black-operation"><a class="download btn-theme-green am-margin-sm" href = "javascript:;">' +
            '<i class="am-icon-pencil"></i> 下载</a >' +
            '<a href="javascript:;" class="delete tpl-table-black-operation-del am-margin-sm">' +
            '<i class="am-icon-trash" ></i> 删除</a></div> ';

        date = new Date(date).Format("yyyy-MM-dd hh:mm:ss");
        filesTable.row.add([
            id,
            name,
            course,
            task,
            filename,
            date,
            $btns
        ])
    }

    function refreshPageInfo() {
        const { recordsDisplay, recordsTotal } = filesTable.page.info();
        $('#page-info').text(`展示:${recordsDisplay},总共:${recordsTotal}`)
    }

    /**
     * 初始化文件面板下拉选框内容
     */
    function initSelectData() {
        $.ajax({
            url: baseUrl + 'course/node' + `?time=${Date.now()}`,
            type: "GET",
            data: {
                "username": username
            }
        }).then(res => {
            const { code } = res;
            if (code === 200) {
                ({ courseList: nodes } = res.data);
                clearselect("#courseList");
                insertToSelect("#courseList", "全部", "-1");
                //填充最新数据
                nodes.forEach(function (key) {
                    if (key.type === 1)
                        insertToSelect("#courseList", key.name, key.id);
                });
                resetselect("#courseList", "success");

                //父类下拉框绑定事件
                $<HTMLSelectElement>('#courseList').on('change', function (e) {
                    filterFlag = "parentType";
                    let parentId = +this.value;
                    clearselect("#taskList");
                    insertToSelect("#taskList", "全部", -1);
                    //如果选择的不是全部
                    if (parentId !== -1) {
                        //加载相应 的子类下拉框
                        nodes.forEach(function (key) {
                            if (key.type === 0 && parentId === key.parent) {
                                insertToSelect("#taskList", key.name, key.id);
                            }
                        });
                    }
                    resetselect("#taskList");
                    filesTable.draw();
                    refreshPageInfo();
                });

                //子类下拉框绑定事件
                $('#taskList').on('change', function () {
                    filterFlag = "childrenType";
                    filesTable.draw();
                    refreshPageInfo();
                });

            }

        })
    }

    /**
     * 清空下拉选择框
     * @param selectid
     */
    function clearselect(selectid) {
        clearpanel(selectid);
        $(selectid).selected('destroy');
    }

    /**
     * 搜索文件表中指定内容
     * @param content 待查找的内容
     */
    function serchTableVal(content) {
        filesTable.search(content).draw();
    }

    /**
     * 重置下拉选择框
     * @param selectid
     */
    function resetselect(selectid, style = 'secondary') {
        $(selectid).selected({
            btnStyle: style
        });
    }

    /**
     * 向下拉选择框插入数据
     * @param selectid
     * @param value
     * @param id
     */
    function insertToSelect(selectid, value, id) {
        $(selectid).append('<option value="' + id + '">' + value + '</option>');
    }

    /**
     * 下载指定的文件
     * @param path 请求的url
     * @param jsonArray 请求携带的参数
     */
    function downloadFile(path, jsonArray) {
        let form = $("<form>");
        form.attr("style", "display:none");
        form.attr("target", "");
        form.attr("method", "get");
        form.attr("action", path);


        jsonArray.forEach(function (key) {
            let temp = $("<input>");
            temp.attr("type", "hidden");
            temp.attr("name", key.key);
            temp.val(key.value);
            form.append(temp);
        });
        $("body").append(form);
        form.submit();
        form.remove();
        // //新窗口打开
        // let newTab = window.open('about:blank')
        // newTab.location.href = path;
        // //关闭新窗口
        // newTab.close();
    }
});