import '../../sass/modules/upload.scss'
import { stringEncode, getRandomStr, AlertModal, getQiNiuUploadToken, downLoadByUrl } from '../common/utils'
import fileApi from '../apis/file.js'
import jqUtils from '@/lib/jqUtils'

import('../common/tongji').then(res => {
    res.default.init()
})

window.onload = function () {
    let baseUrl = "/EasyPicker/";
    let uname: string; //提交者姓名
    let ucourse: string; //父类目名称
    let utask: string; //子类目名称
    let account: string; //管理员账号
    let limited = false; //是否限了制提交人员
    let loadParentComplete = false; //父类是否加载完成

    const Alert = (() => {
        let t = new AlertModal()
        return t.show.bind(t)
    })();

    //设置全局ajax设置
    $.ajaxSetup({
        // 默认添加请求头
        error: function () {
            Alert("网络错误");
        }
    });

    /**
     * 上传文件
     */
    const fileList: SuperFile[] = []

    function checkFileIsExist(key) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "get",
                url: baseUrl + "file/qiniu/exist",
                data: {
                    key
                },
                success(res) {
                    resolve(res.data.isExist)
                },
                error(err) {
                    reject(err)
                }
            })
        })
    }
    async function beforeUpload() {
        for (const f of fileList) {
            const { file: { name: filename }, status, id } = f
            if (status != 1 && status !== 2) {
                // 原文件名称
                let prefix = filename.slice(0, filename.indexOf('.'))
                let ext = filename.slice(prefix.length)
                const getKey = () => {
                    return `${account}/${ucourse}/${utask}/${prefix}${ext}`
                }
                let t = prefix
                let i = 1
                let exist = await checkFileIsExist(getKey())
                while (exist) {
                    prefix = t
                    prefix += `_${i++}`
                    exist = await checkFileIsExist(getKey())
                }
                f.filename = `${prefix}${ext}`;
            }
        }
    }

    function startUpload(token) {
        for (const f of fileList) {
            const { file, status, id, filename } = f
            const fileItem = $(`#${id}`)
            const process = fileItem.find(".progress")[0]
            const deleteDom = fileItem.find('.delete')[0]
            if (status !== 1 && status !== 2) {
                let key = `${account}/${ucourse}/${utask}/${filename}`
                const observable = qiniu.upload(file, key, token)
                deleteDom?.remove();
                f.status = 2
                const subscription = observable.subscribe({
                    next(res) {
                        const { total: { percent } } = res
                        const width = percent.toFixed(2) + '%'
                        process.style.width = width
                        process.textContent = width
                    },
                    error(err) {
                        f.status = -1
                        process.textContent = "上传失败"
                        process.classList.replace('am-progress-bar-secondary', 'am-progress-bar-danger')
                        Alert(JSON.stringify(err));
                        fileItem.append(deleteDom)
                    },
                    complete(res) {
                        f.status = 1
                        const { hash, key } = res
                        process.textContent = "上传成功"
                        process.classList.replace('am-progress-bar-secondary', 'am-progress-bar-success')
                        addReport(uname, ucourse, utask, filename, account);
                    }
                })
                // subscription.close() // 取消上传
            }
        }
    }
    /**
     * 选择文件
     */
    $<HTMLInputElement>('#picker input').on('change', function (e) {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }
        const isExist = fileList.filter(f => {
            return f.file.name === file.name && file.size === f.file.size
        }).length !== 0
        if (isExist) {
            Alert("该文件已存在")
            return
        }
        if (file.name.indexOf(".") === -1 || file.name.indexOf(".") === file.name.length - 1) {
            Alert("文件必须有后缀", "文件名称不支持")
            return
        }
        const tFile = {
            status: 0, // -1 0 1 2|失败 待上传 上传成功 上传中
            file,
            id: getRandomStr(7)
        }
        fileList.push(tFile)
        let dom = `<li class="file-item" id="${tFile.id}">
                    <h4 class="am-margin-bottom-sm">${file.name}</h4>
                        <div class="am-progress am-progress-striped am-active am-progress-lg">
                            <div status="${tFile.status}" class="progress am-progress-bar am-progress-bar-secondary" style="width: 100%">
                                等待上传。。。
                            </div>
                        </div>
                        <span class="delete am-icon-close"></span>
                    </li>`;
        $('#thelist').append(dom);
    })
    // 移除文件
    $('#thelist').on('click', '.delete', function (e) {
        const fileItem = $(this).parents('.file-item');
        const fileId = fileItem.attr('id')
        if (!confirm("确认移除此文件？")) {
            return
        }
        fileList.splice(fileList.findIndex(v => {
            return v.id === fileId
        }), 1)
        fileItem.remove()
        $('#picker input').val('')
    })
    // 开始上传
    $('#uploadBtn').on('click', function () {
        ucourse = $('option[value="' + $("#course").val() + '"]').html();
        utask = $('option[value="' + $("#task").val() + '"]').html();
        uname = $('#name').val() as string;
        uname = stringEncode(uname)
        if (uname.trim() == null || uname.trim() == "") {
            Alert('姓名不能为空');
            return;
        }
        if (fileList.filter(v => v.status !== 1 && v.status !== 2).length === 0) {
            Alert("没有可上传的文件")
            return
        }
        const start = () => {
            getQiNiuUploadToken().then(res => {
                $("#uploadBtn").button("loading");
                $('#name').attr('disabled', 'disabled')
                beforeUpload().then(() => {
                    startUpload(res.data.data)
                })
            })
        }

        if (limited) {
            //    检查是否在提交名单中
            $.ajax({
                url: baseUrl + "people/people" + `?time=${Date.now()}`,
                type: "GET",
                data: {
                    "username": account,
                    "parent": ucourse,
                    "child": utask,
                    "name": uname
                }
            }).then(res => {
                const { code } = res;
                if (code === 200) {
                    const { isSubmit } = res.data;
                    if (!isSubmit || confirm("你已经提交过,是否再次提交")) {
                        $("#uploadBtn").button("loading");
                        start()
                    }
                } else {
                    Alert("抱歉你不在提交名单之中,如有疑问请联系管理员.");
                }
            });
        } else {
            start()
        }
    });
    //页面初始化
    init();

    /**
     * 父类发生改变
     */
    $("#course").on('change', function () {
        setdata('children', $(this).val(), account);
    });

    // 丢弃中间请求
    let tempFlag = 1
    /**
     * 子类发生改变
     */
    $("#task").on('change', function () {
        if (!loadParentComplete && utask) return;
        if (!$(this).val()) {
            return
        }

        const request = (key) => {
            $.ajax({
                url: baseUrl + "childContent/childContent" + `?time=${Date.now()}`,
                type: "GET",
                data: {
                    "taskid": $(this).val()
                },
                success: function (res) {
                    if (key !== tempFlag) {
                        return
                    }
                    jqUtils.unFreezeBtn($('#uploadBtn'))
                    //如果有数据
                    const { code } = res;
                    if (code === 200) {
                        $("#attributePanel").show();

                        res = res.data;
                        limited = res.people;
                        if (res.ddl) {
                            //取得日期面板dom
                            let $ddl = $("#attributePanel").children('div[target="ddl"]');
                            //显示截止日期
                            $ddl.children().eq(0).html("截止日期:" + new Date(res.ddl).Format("yyyy-MM-dd,hh:mm:ss"));
                            const fn = () => {
                                let str = "已经截止!!!"
                                //计算日期间隔
                                if (Date.now() > res.ddl) {
                                    jqUtils.freezeBtn($('#uploadBtn'))
                                    $ddl.children().eq(1).html(str);
                                    return
                                }
                                str = "还剩:" + calculateDateDiffer(res.ddl, (new Date().getTime()))
                                $ddl.children().eq(1).html(str);
                                requestAnimationFrame(fn)
                            }
                            fn()
                            //显示时间面板
                            $ddl.show();
                        } else {
                            //隐藏截止时间面板
                            $("#attributePanel").children('div[target="ddl"]').hide();
                        }
                        if (res.template) {
                            $("#attributePanel").children('div[target="template"]').show();
                            // $("#downlloadTemplate").attr("filename",res.template);
                            $("#downlloadTemplate").unbind('click');
                            $("#downlloadTemplate").on('click', function () {
                                let parent = $("#course").next().children().eq(0).find(".am-selected-status").html();
                                let child = $("#task").next().children().eq(0).find(".am-selected-status").html() + "_Template";
                                let jsonArray: any[] = []
                                let { template } = res
                                jsonArray.push({ "key": "course", "value": parent });
                                jsonArray.push({ "key": "tasks", "value": child });
                                jsonArray.push({ "key": "filename", "value": template });
                                jsonArray.push({ "key": "username", "value": account });
                                const $btn = $(this);
                                fileApi.checkFileIsExist(account, parent, child, template).then(res => {
                                    const { where } = res.data
                                    if (where === 'server') {
                                        downloadFile(baseUrl + "file/down", jsonArray);
                                        $btn.button('loading');
                                        setTimeout(function () {
                                            $btn.button('reset');
                                        }, 5000);
                                    } else if (where === 'oss') {
                                        fileApi.getFileDownloadUrl(account, parent, child, template).then(res => {
                                            const { url } = res.data
                                            downLoadByUrl(url)
                                            $btn.button('loading');
                                            setTimeout(function () {
                                                $btn.button('reset');
                                            }, 5000);
                                        })
                                    } else {
                                        Alert('由于历史原因,老版平台上传的文件已经被清理', '源文件已经被删除')
                                    }
                                })
                            });
                        } else {
                            $("#attributePanel").children('div[target="template"]').hide();
                        }
                    } else {
                        //    如果没有数据
                        limited = false;
                        $("#attributePanel").hide();
                    }
                }
            });
        }
        request(++tempFlag)
    });

    /**
     * 加载底部导航链接
     */
    function loadBottomLinks() {
        const links = [{
            href: "/",
            text: "首页"
        }, {
            href: "https://github.com/ATQQ/EasyPicker",
            text: "GitHub"
        },
        {
            href: "https://sugar-js.gitbook.io/easypicker-manual/",
            text: "使用手册"
        },
        {
            href: "https://github.com/ATQQ/EasyPicker/issues",
            text: "问题反馈"
        }
        ];
        const docFrag = document.createDocumentFragment();
        links.forEach((link) => {
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.href = link.href;
            a.target = "_blank";
            a.textContent = link.text;
            li.appendChild(a);
            docFrag.appendChild(li);
        });
        document.getElementById('bottom-links')?.appendChild(docFrag);
    }


    /**
     * 返回日期间隔时间
     * @param old  带比较的时间
     * @param now 当前的时间
     */
    function calculateDateDiffer(old, now) {
        let day = 0;
        let hour = 0;
        let minute = 0;
        let seconds = 0;
        let differ = Math.floor(Number((old - now) / 1000));
        day = Math.floor(differ / (24 * 60 * 60)); //天
        differ -= day * (24 * 60 * 60);

        hour = Math.floor(differ / (60 * 60)); //时
        differ -= hour * (60 * 60);

        minute = Math.floor(differ / 60); //分

        seconds = Math.floor(differ % 60); //秒

        return day + "天" + hour + "时" + minute + "分" + seconds + "秒";
    }

    /**
     * @param name
     * @param course
     * @param tasks
     * @param filename
     */
    function addReport(name, course, tasks, filename, username) {
        $.ajax({
            url: baseUrl + 'report/save',
            async: true,
            contentType: "application/json",
            type: 'POST',
            data: JSON.stringify({
                "name": name,
                "course": course,
                "tasks": tasks,
                "filename": filename,
                "username": username
            })
        }).then(res => {
            if (res.code === 200) {
                Alert(`${filename}提交成功`)
            } else {
                Alert(`${filename}提交失败`);
            }
            $("#uploadBtn").button("reset");
            $('#name').removeAttr('disabled')
        })
    }

    /**
     * 初始化数据
     */
    function init() {
        $('#course').empty();
        $('#task').empty();
        //获取链接中 的管理员账号与附加参数
        let params = ''
        try {
            params = decodeURI(decodeURI(decodeURI(atob(location.search.slice(1)))))
        } catch (err) {
            Alert('链接无效!!!,请联系管理员')
            redirectHome()
            return
        }

        const paramsData: UploadParamData = params.split('&').reduce((pre, now) => {
            const kv = now.split('=')
            pre[kv[0]] = kv[1]
            return pre
        }, {})
        let type: number = 1; //三种情况
        //1 :获取全部父类
        //2 :获取指定父类
        //3: 获取指定子类
        let { username, parent, child } = paramsData
        if (location.search.includes('?')) {
            if (parent) {
                type = 2;
                if (child) {
                    type = 3;
                }
            }
        } else {
            // 废弃
            type = 1;
        }

        if (!username || !type || type === 1) {
            Alert("链接失效!!!");
            redirectHome();
            return
        }

        account = username;
        //查询账号是否有效
        $.ajax({
            url: baseUrl + 'user/check',
            async: false,
            contentType: "application/json",
            type: 'POST',
            data: JSON.stringify({
                "username": username
            }),
            success: function (res) {
                if (res) {
                    switch (type) {
                        //获取父类全部子类
                        case 2:
                            setDataByParent(type, parent, username);
                            break;
                        //获取指定子类
                        case 3:
                            setDataByChild(type, parent, child, username);
                            break;
                    }
                } else {
                    Alert("链接失效!!!");
                    redirectHome();
                }
            },
            error: function () {
                Alert("网络错误");
                redirectHome();
            }
        })
        //加载导航数据
        loadBottomLinks();
    }

    /**
     * 重定向到首页
     */
    function redirectHome() {
        window.location.href = "/"
    }


    /**
     * 获取课程/任务数据
     * @param range
     * @param parentid
     * @param username
     */
    function setdata(range, parentid, username) {
        if (!range || !parentid || !username) {
            return
        }
        $.ajax({
            url: baseUrl + 'course/check?' + `timestamp=${new Date().getTime()}`,
            async: true,
            contentType: "application/json",
            type: 'GET',
            data: {
                "range": range,
                "contentid": parentid,
                "username": username
            },
            success: function (res) {
                const { code } = res;
                if (code !== 200) {
                    return;
                }
                let courseList = res.data.courseList || []
                if (courseList.length === 0) {
                    if (range === 'parents') {
                        clearselect('#course');
                        resetselect("#course");
                    } else {
                        clearselect("#task");
                        resetselect("#task");
                        Alert("链接失效!!!");
                        redirectHome();
                    }
                    return;
                }
                if (range === 'parents') {
                    clearselect('#course');
                    courseList.forEach(v => {
                        insertToSelect("#course", v.name, v.id);
                    });
                    resetselect("#course");
                } else if (range === 'children') {
                    clearselect("#task");
                    courseList.forEach(v => {
                        insertToSelect("#task", v.name, v.id);
                    });
                    resetselect("#task");
                }
                loadParentComplete = true;
            }
        })
    }

    /**
     * 设置提交指定父节点信息
     * @param type
     * @param parent
     * @param username
     */
    function setDataByParent(type, parent, username) {
        if (!type || !parent || !username) {
            return
        }
        $.ajax({
            url: baseUrl + 'course/course?' + `timestamp=${new Date().getTime()}`,
            contentType: "application/json",
            type: 'GET',
            data: {
                "type": type,
                "parent": parent,
                "username": username
            },
            success: function (res) {
                const { data: { status } } = res;
                if (status) {
                    let node = res.data.data;
                    clearselect('#course');
                    insertToSelect("#course", node.name, node.id);
                    resetselect("#course");
                } else {
                    Alert("链接失效");
                    redirectHome();
                }
            }
        });
    }

    /**
     * 设置提交指定子节点信息
     * @param type
     * @param parent
     * @param child
     * @param username
     */
    function setDataByChild(type, parent, child, username) {
        //查询父节点信息
        $.ajax({
            url: baseUrl + 'course/course?' + `timestamp=${new Date().getTime()}`,
            contentType: "application/json",
            type: 'GET',
            data: {
                "type": 2,
                "parent": parent,
                "username": username
            }
        }).done(res => {
            if (res.data.status) {
                let node = res.data.data;
                clearselect('#course');
                insertToSelect("#course", node.name, node.id);
                resetselect("#course");

                //查询子节点信息
                $.ajax({
                    url: baseUrl + 'course/course?' + `timestamp=${new Date().getTime()}`,
                    contentType: "application/json",
                    type: 'GET',
                    data: {
                        "type": type,
                        "parent": parent,
                        "child": child,
                        "username": username
                    }
                }).done(res => {
                    if (res.data.status) {
                        let node = res.data.data;
                        const handler = setInterval(() => {
                            if (loadParentComplete) {
                                clearselect("#task");
                                insertToSelect("#task", node.name, node.id);
                                resetselect("#task");
                                clearInterval(handler);
                            }
                        }, 1);

                    } else {
                        Alert("链接失效");
                        redirectHome();
                    }
                });
            } else {
                Alert("链接失效");
                redirectHome();
            }
        })


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
     * 清空下拉选择框
     * @param selectid
     */
    function clearselect(selectid) {
        $(selectid).empty();
        $(selectid).selected('destroy');
    }

    /**
     * 重置下拉选择框
     * @param selectid
     */
    function resetselect(selectid) {
        $(selectid).selected({
            btnStyle: 'secondary'
        });
    }

    /**
     * 关闭指定弹出层
     * @param {String} id 弹出层id
     */
    function closeModel(id) {
        $(id).modal('close');
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
};