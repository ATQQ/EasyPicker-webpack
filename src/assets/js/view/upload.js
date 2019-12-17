import '../../sass/modules/upload.scss'
import '../../css/webuploader.css'
$(document).ready(function() {
    let baseUrl = "/Api";
    let uname = null; //提交者姓名
    let ucourse = null; //父类目名称
    let utask = null; //子类目名称
    let account = null; //管理员账号
    let limited = false; //是否限了制提交人员
    let loadParentComplete = false; //父类是否加载完成

    //设置全局ajax设置
    $.ajaxSetup({
        // 默认添加请求头
        error: function() {
            alert("网络错误");
        }
    });

    /**
     * 上传文件
     */

    //文件上传对象
    let uploader = WebUploader.create({
        //选择完文件或是否自动上传
        auto: false,
        //swf文件路径
        swf: '../plunge/Uploader.swf',
        //是否要分片处理大文件上传。
        chunked: false,
        // 如果要分片，分多大一片？ 默认大小为5M.
        chunkSize: 5 * 1024 * 1024,
        // 上传并发数。允许同时最大上传进程数[默认值：3]   即上传文件数
        threads: 1,
        //文件接收服务端
        server: baseUrl + "file/save",
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#picker',
        method: "POST",
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false,
        formData: {
            course: ucourse,
            task: utask
        }
    });

    // 当有文件被添加进队列的时候
    uploader.on('fileQueued', function(file) {
        let $list = $('#thelist');
        $list.append('<div id="' + file.id + '" class="item">' +
            '<h4 class="info am-margin-bottom-sm">' + file.name + '</h4>' +
            '<p class="state fw-text-c">等待上传...</p>' +
            '</div>');
    });
    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function(file, percentage) {
        let $li = $('#' + file.id);
        $li.find('p.state').text(`上传中:${percentage.toFixed(2) * 100}`);
    });


    // 文件上传成功处理。
    uploader.on('uploadSuccess', function(file, response) {
        $('#' + file.id).find('p.state').text('上传完成');
        const { filename } = response.data;
        addReport(uname, ucourse, utask, filename, account);
        $("#name").val("");
    });

    //上传出错
    uploader.on('uploadError', function(file) {
        $('#' + file.id).find('p.state').text('上传出错');
    });

    // 开始上传
    $('#uploadBtn').on('click', function(e) {
        ucourse = $('option[value="' + $("#course").val() + '"]').html();
        utask = $('option[value="' + $("#task").val() + '"]').html();

        uname = $('#name').val();
        if (uname.trim() == null || uname.trim() == "") {
            alert('姓名不能为空');
            return;
        }
        uploader.options.formData.course = ucourse;
        uploader.options.formData.task = utask;
        uploader.options.formData.account = account;
        uploader.options.formData.username = uname;
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
                    if (!isSubmit) {
                        $("#uploadBtn").button("loading");
                        uploader.upload();
                    } else if (confirm("你已经提交过,是否再次提交")) {
                        $("#uploadBtn").button("loading");
                        uploader.upload();
                    }
                } else {
                    alert("抱歉你不在提交名单之中,如有疑问请联系管理员.");
                }
            });
        } else {
            uploader.upload();
        }

    });
    //上传之前
    uploader.on('uploadBeforeSend', function(block, data) {
        $("#uploadBtn").button("loading");
    });
    //页面初始化
    init();

    /**
     * 父类发生改变
     */
    $("#course").on('change', function() {
        setdata('children', $(this).val(), account);
    });

    /**
     * 子类发生改变
     */
    $("#task").on('change', function() {
        if (!loadParentComplete && utask) return;
        $.ajax({
            url: baseUrl + "childContent/childContent" + `?time=${Date.now()}`,
            type: "GET",
            data: {
                "taskid": $(this).val()
            },
            success: function(res) {
                $('#uploadBtn').attr("disabled", false);
                //如果有数据
                const { code } = res;
                if (code === 200) {
                    $("#attributePanel").show();

                    res = res.data;
                    limited = res.people;
                    // console.log(limited);
                    if (res.ddl) {
                        //取得日期面板dom
                        let $ddl = $("#attributePanel").children('div[target="ddl"]');
                        //显示截止日期
                        $ddl.children().eq(0).html("截止日期:" + new Date(res.ddl).Format("yyyy-MM-dd,hh:mm:ss"));
                        //计算日期间隔
                        $ddl.children().eq(1).html(calculateDateDiffer(res.ddl, (new Date().getTime())) ? "还剩:" + calculateDateDiffer(res.ddl, (new Date().getTime())) : "已经截止!!!");
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
                        $("#downlloadTemplate").on('click', function() {
                            let parent = $("#course").next().children().eq(0).find(".am-selected-status").html();
                            let child = $("#task").next().children().eq(0).find(".am-selected-status").html();
                            let jsonArray = new Array();
                            jsonArray.push({ "key": "course", "value": parent });
                            jsonArray.push({ "key": "tasks", "value": child + "_Template" });
                            jsonArray.push({ "key": "filename", "value": res.template });
                            jsonArray.push({ "key": "username", "value": account });
                            downloadFile(baseUrl + "file/down", jsonArray);
                            let $btn = $(this);
                            $btn.button('loading');
                            setTimeout(function() {
                                $btn.button('reset');
                            }, 5000);
                        });
                    } else {
                        $("#attributePanel").children('div[target="template"]').hide();
                    }
                } else {
                    //    如果没有数据
                    limited = false;
                    $("#attributePanel").hide();
                }
            },
            error: function(e) {
                alert("网络错误");
            }
        });
    });

    /**
     * 管理员登录
     */
    $('#login-btn').on('click', function(e) {
        let username = $('#username').val();
        let pwd = $('#password').val();
        if (isEmpty(username)) {
            alert('账号为空')
            return;
        }
        if (isEmpty(pwd)) {
            alert("密码为空");
            return;
        }
        login(username, pwd);
        e.stopPropagation();
    });

    /**
     * 加载底部导航链接
     */
    function loadBottomLinks() {
        const links = [{
                href: "/EasyPicker/home",
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
        document.getElementById('bottom-links').appendChild(docFrag);
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
        if (now > old) {
            $('#uploadBtn').attr("disabled", true);
            return false;
        }
        let differ = Math.floor(Number((old - now) / 1000));
        day = Math.floor(differ / (24 * 60 * 60)); //天
        differ -= day * (24 * 60 * 60);
        // console.log(differ);

        hour = Math.floor(differ / (60 * 60)); //时
        differ -= hour * (60 * 60);
        // console.log(differ);

        minute = Math.floor(differ / 60); //分

        seconds = Math.floor(differ % 60); //秒

        return day + "天" + hour + "时" + minute + "分" + seconds + "秒";
    }


    /**
     * 判断字符串是否为空
     * @param str
     * @returns {boolean}
     */
    function isEmpty(str) {
        return (str == null || str.trim() == '');
    }

    /**
     * 增加报告
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
                alert("提交成功");
            } else {
                alert("提交失败");
            }
            $("#uploadBtn").button("reset");
        })
    }

    /**
     * 初始化数据
     */
    function init() {
        $('#course').empty();
        $('#task').empty();
        //获取链接中 的管理员账号与附加参数

        let type = null; //三种情况
        //1 :获取全部父类
        //2 :获取指定父类
        //3: 获取指定子类

        let str = window.location.href;
        let username = null;
        let paramStr = null;
        let parent = "";
        let child = "";
        if (str.lastIndexOf('?') !== -1) {
            username = decodeURI(decodeURI(str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf('?'))));
            paramStr = str.substring(str.lastIndexOf('?') + 1);
            //解码
            paramStr = decodeURI(decodeURI(paramStr));
            //获取parent/child
            parent = getUrlParam(paramStr, 'parent');
            child = getUrlParam(paramStr, 'child');
            if (parent) {
                type = 2;
                if (child) {
                    type = 3;
                }
            }
        } else {
            username = str.substring(str.lastIndexOf("/") + 1);
            type = 1;
        }


        if (username === "" || username == null || type == null) {
            alert("链接失效!!!");
            redirectHome();
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
                success: function(res) {
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
                        alert("链接失效!!!");
                        redirectHome();
                    }
                },
                error: function() {
                    alert("网络错误");
                    redirectHome();
                }
            })
            //加载导航数据
        loadBottomLinks();
    }

    /**
     * 获取Url中的参数
     * @param url 地址Url 或者 Url中参数部分
     * @param paramName
     */
    function getUrlParam(url, paramName) {
        let isExist = false;
        let res = null;
        isExist = url.lastIndexOf(paramName + '=') !== -1;
        if (isExist) {
            res = url.substring(url.indexOf(paramName + '=') + paramName.length + 1, (url.indexOf('&') > url.indexOf(paramName + '=') ? url.indexOf('&') : url.length));
        }
        return res;
    }

    /**
     * 重定向到首页
     */
    function redirectHome() {
        // window.location.href = "index.html"
    }

    /**
     * 查询用户是否存在
     * @param username
     */
    function checkUser(username) {
        $.ajax({
            url: baseUrl + 'user/check',
            async: false,
            contentType: "application/json",
            type: 'POST',
            data: JSON.stringify({
                "username": username
            }),
            success: function(res) {
                return res;
            },
            error: function() {
                return false;
            }
        })
    }

    /**
     * 获取课程/任务数据
     * @param range
     * @param parentid
     * @param username
     */
    function setdata(range, parentid, username) {
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
            success: function(res) {
                const { code, data: { courseList } } = res;
                if (code !== 200) {
                    return;
                }
                if (courseList.length === 0) {
                    if (range === 'parents') {
                        clearselect('#course');
                        resetselect("#course");
                    } else {
                        clearselect("#task");
                        resetselect("#task");
                        alert("链接失效!!!");
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
            },
            error: function() {
                alert("网络错误");
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
        $.ajax({
            url: baseUrl + 'course/course?' + `timestamp=${new Date().getTime()}`,
            contentType: "application/json",
            type: 'GET',
            data: {
                "type": type,
                "parent": parent,
                "username": username
            },
            success: function(res) {
                const { data: { status } } = res;
                if (status) {
                    let node = res.data.data;
                    clearselect('#course');
                    insertToSelect("#course", node.name, node.id);
                    resetselect("#course");
                } else {
                    alert("链接失效");
                    redirectHome();
                }
            },
            error: function() {
                alert("网络错误");
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
                        alert("链接失效");
                        redirectHome();
                    }
                });
            } else {
                alert("链接失效");
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


        jsonArray.forEach(function(key) {
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

    /**
     * 向指定路径发送下载请求
     * @param{String} url 请求路径
     * @param {String} filename 文件名
     */
    function downLoadByUrl(url, filename) {
        let xhr = new XMLHttpRequest();
        //GET请求,请求路径url,async(是否异步)
        xhr.open('GET', url, true);
        //设置请求头参数的方式,如果没有可忽略此行代码
        // xhr.setRequestHeader("token", token);
        //设置响应类型为 blob
        xhr.responseType = 'blob';
        //关键部分
        xhr.onload = function(e) {
            //如果请求执行成功
            if (this.status == 200) {
                let blob = this.response;
                // let filename = "我是文件名.xxx";//如123.xls
                let a = document.createElement('a');

                blob.type = "multipart/form-data";
                //创键临时url对象
                let url = URL.createObjectURL(blob);

                a.href = url;
                a.download = filename;
                a.click();
                //释放之前创建的URL对象
                window.URL.revokeObjectURL(url);
            }
        };
        //发送请求
        xhr.send();
    }

    /**
     * 打开指定弹出层
     * @param {String} id 弹出层id
     * @param {boolean} close 设置点击遮罩层是否可以关闭
     */
    function openModel(id, close) {
        $(id).modal({
            closeViaDimmer: close //设置点击遮罩层无法关闭
        });
        $(id).modal('open');
    }

});