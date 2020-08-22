//引入样式
import '../../sass/modules/index.scss'

import { amModal } from './../common/utils'
import { userApi } from 'apis/index'
import { rMobile, rCode, rPassword } from '@/lib/regExp'
import jqUtils from '@/lib/jqUtils'
import { themeColor } from '@/lib/enums'

$(document).ready(function () {
    var isGetCode = false;
    /**
     * 页面初次完成渲染后
     */
    loadLocatAccount();

    /**
     * 输入框内容发生改变时，改变展示的背景色
     */
    $('input').on('change', function (e) {
        const { id, value } = e.currentTarget as HTMLInputElement
        // 不处理注册框的手机号绑定框
        if (id === 'userMobile') {
            return;
        }
        // 不为空则恢复原色（蓝色）
        if (value) {
            changeInputGroupColor($(this).parent(), themeColor.secondary);
        }
    });

    let yzTimes = 90; // 注册框验证码时间
    /**
     * 注册框的手机号输入发生变动时
     */
    $('#userMobile').on('input', function (e) {
        const { value } = e.target as HTMLInputElement
        const $inputGroup = $(this).parent()
        const $getCode = $('#getCode')
        // 手机号有效
        if (rMobile.test(value)) {
            if (yzTimes === 90) {
                jqUtils.unFreezeBtn($getCode)
            }
            changeInputGroupColor($inputGroup, themeColor.secondary);
            return
        }
        // 手机号无效
        jqUtils.freezeBtn($getCode)
        changeInputGroupColor($inputGroup, themeColor.danger);
    });

    let yzTimes2 = 90; //重置密码验证码等待时间
    /**
     * 忘记密码手机号输入框内容改变
     */
    $('#bindPhone').on('input', function (e) {
        const { value } = e.target as HTMLInputElement
        const $inputGroup = $(this).parent()
        const $getForgetCode = $('#getForgetCode')
        if (rMobile.test(value)) {
            if (yzTimes2 === 90) {
                jqUtils.unFreezeBtn($getForgetCode)
            }
            changeInputGroupColor($inputGroup, themeColor.secondary);
            return
        }

        jqUtils.freezeBtn($getForgetCode)
        changeInputGroupColor($inputGroup, themeColor.danger);
    });

    /**
     * 忘记密码获取验证码
     */
    $('#getForgetCode').on('click', function (e) {
        const $getForgetCode = $(this)
        var fun = function () {
            yzTimes2--;
            $getForgetCode.html(yzTimes2 + "(s)");
            if (yzTimes2 === 0) {
                yzTimes2 = 90;
                jqUtils.unFreezeBtn($getForgetCode)
                $getForgetCode.html("获取验证码");
                return;
            }
            setTimeout(fun, 1000);
        };

        const mobile = $(this).parent().parent().prev().find('input').val() as string;

        if (!rMobile.test(mobile)) {
            return
        }

        userApi.getCode(mobile).then(res => {
            if (res.code === 200) {
                jqUtils.freezeBtn($getForgetCode)
                //开始执行
                fun();
            } else {
                amModal.alert(res.errMsg);
            }
        })
    });

    /**
     * 确认重置密码
     */
    $('#sureReset').on('click', function () {
        const $sureReset = $(this)
        var $inputs = $('#forgetPanel').find('input');
        const phoneNumber = $inputs.eq(0).val() as string; //手机号
        const code = $inputs.eq(1).val() as string; //验证码
        const newPwd = $inputs.eq(2).val() as string; //新密码

        if (phoneNumber.length !== 11) {
            $inputs.eq(0).val('');
            resetPlaceHolder($inputs.eq(0), "手机号格式不正确");
            changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
            return;
        }
        if (!rCode.test(code)) {
            $inputs.eq(1).val('');
            resetPlaceHolder($inputs.eq(1), "验证码格式不正确");
            changeInputGroupColor($inputs.eq(1).parent(), themeColor.danger);
            return;
        }
        if (!rPassword.test(newPwd)) {
            $inputs.eq(2).val('');
            resetPlaceHolder($inputs.eq(2), "6-16位(数字/字母/@#$%)");
            changeInputGroupColor($inputs.eq(2).parent(), themeColor.danger);
            return;
        }

        userApi.resetPassword(phoneNumber, newPwd, code).then(res => {
            switch (res.code) {
                case 20023:
                    $inputs.eq(1).val('');
                    resetPlaceHolder($inputs.eq(1), "验证码不不匹配");
                    changeInputGroupColor($inputs.eq(1).parent(), themeColor.danger);
                    break;
                case 200:
                    $sureReset.next().click();
                    amModal.alert("重置成功");
                    yzTimes2 = 1;
                    break;
                case 20020:
                    $inputs.eq(1).val('');
                    resetPlaceHolder($inputs.eq(1), "验证码不正确");
                    changeInputGroupColor($inputs.eq(1).parent(), themeColor.danger);
                    break;
                case 20014:
                    $inputs.eq(0).val('');
                    resetPlaceHolder($inputs.eq(0), "手机号不存在");
                    changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
                    break;
                case 20012:
                    $inputs.eq(0).val('');
                    resetPlaceHolder($inputs.eq(0), "手机号已经存在");
                    changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
                    break;
                default:
                    amModal.alert("未知异常,请联系管理员");
                    break;
            }
        })
    });

    /**
     * 是否开启绑定手机号的面板
     */
    $('#isBindMobile').on('change', function (e) {
        if ($(this).is(':checked')) {
            $(this).parent().prev().removeAttr('readonly').parent().next().show();
        } else {
            $(this).parent().prev().attr('readonly', 'readonly').parent().next().hide();
        }
    });

    /**
     * 用户登录
     */
    $('#login').on('click', function () {
        var $inputs = $('#loginPanel').find('input');
        var username = $inputs.eq(0).val() as string;
        var pwd = $inputs.eq(1).val() as string;
        if (isEmpty(username)) {
            resetPlaceHolder($inputs.eq(0), "账号为空");
            changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
            return;
        }
        if (isEmpty(pwd)) {
            resetPlaceHolder($inputs.eq(1), "密码为空");
            changeInputGroupColor($inputs.eq(1).parent(), themeColor.danger);
            return;
        }
        login(username, pwd);
    })


    /**
     * 新用户注册获取验证码
     */
    $('#getCode').on('click', function (e) {

        let that = this;
        const fun = function () {
            yzTimes--;
            $(that).html(yzTimes + "(s)");
            if (yzTimes === 0) {
                yzTimes = 90;
                $(that).removeAttr('disabled');
                $(that).html("获取验证码");
                return;
            }
            setTimeout(fun, 1000);
        };

        const mobile = $(this).parent().parent().prev().find('input').val() as string;
        userApi.getCode(mobile).then(res => {
            if (res.code === 200) {
                $(that).attr('disabled', 'disabled');
                //开始执行
                fun();
                isGetCode = true;
            } else {
                amModal.alert(res.errMsg);
            }
        })
    });

    /**
     * 确认新用户注册
     */
    $('#register').on('click', function () {
        var that = this;
        var $inputs = $('#registerPanel').find('input');
        var username = $inputs.eq(0).val() as string;
        var pwd1 = $inputs.eq(1).val() as string; //第一次密码
        var pwd2 = $inputs.eq(2).val() as string; //第二次密码
        var mobile = $inputs.eq(3).val() as string; //手机号
        var code = $inputs.eq(5).val() as string; //验证码
        //判断账号是否符合条件
        if (isEmpty(username) || username.length > 12) {
            resetPlaceHolder($inputs.eq(0), "账号为空");
            changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
            return;
        }
        if (isEmpty(pwd1) || pwd1.length > 16 || pwd1.length < 6) {
            $inputs.eq(1).val('');
            resetPlaceHolder($inputs.eq(1), "密码不符合规范(6-16位)");
            changeInputGroupColor($inputs.eq(1).parent(), themeColor.danger);
            return;
        }
        if (pwd1 != pwd2) {
            $inputs.eq(2).val('');
            resetPlaceHolder($inputs.eq(2), "两次密码不一致");
            changeInputGroupColor($inputs.eq(2).parent(), themeColor.danger);
            return;
        }

        //判断是否需要绑定手机号
        if ($('#isBindMobile').is(':checked')) {
            //判断手机号
            if (!rMobile.test(mobile)) {
                // console.log("success");
                changeInputGroupColor($inputs.eq(3).parent(), themeColor.danger);
                return;
            }
            //判断验证码
            if (code.length != 4) {
                $inputs.eq(5).val('');
                resetPlaceHolder($inputs.eq(5), "验证码格式不正确");
                changeInputGroupColor($inputs.eq(5).parent(), themeColor.danger);
                return;
            }
        } else {
            mobile = ''
            code = ''
        }

        userApi.register(username, pwd1, mobile, code).then(res => {
            const { code } = res;
            switch (code) {
                case 200:
                    amModal.alert('注册成功');
                    $('input').val('');
                    $(that).next().click();
                    isGetCode = false;
                    break;
                case 20013:
                    $inputs.eq(0).val('');
                    resetPlaceHolder($inputs.eq(0), "账号已存在");
                    changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
                    break;
                case 20012:
                    $inputs.eq(3).val('');
                    resetPlaceHolder($inputs.eq(3), "手机号已存在");
                    changeInputGroupColor($inputs.eq(3).parent(), themeColor.danger);
                    break;
                case 20020:
                    $inputs.eq(5).val('');
                    resetPlaceHolder($inputs.eq(5), "验证码不正确");
                    changeInputGroupColor($inputs.eq(5).parent(), themeColor.danger);
                    break;
                default:
                    break;
            }
        })
    })

    /**
     * 初始化面板数据
     */
    function resetInputPlaceholder() {
        var $inputs = $('#registerPanel').find('input');
        resetPlaceHolder($inputs.eq(0), "请输入注册账号");
        resetPlaceHolder($inputs.eq(1), "请输入密码");
        resetPlaceHolder($inputs.eq(2), "请再次输入密码");
        resetPlaceHolder($inputs.eq(3), "(可选)绑定手机号");
        // resetPlaceHolder($inputs.e)
        resetPlaceHolder($inputs.eq(5), "输入验证码");
        isGetCode = false;
        // yzTimes=90;
    }

    /**
     * 切换登录/注册面板/忘记密码面板
     */
    $('.changePanel').on('click', function () {
        $('div.homePanel').hide(); //隐藏全部
        const panelKey = $(this).attr('targetPanel');
        $('div.homePanel[panel="' + panelKey + '"]').addClass("flipInY").show();
        resetInputPlaceholder();
    });

    /**
     * 重置输入框placeHolder内容
     * @param {input} $input
     * @param {String} placeholder
     */
    function resetPlaceHolder($input: JQuery<HTMLElement>, placeholder: string) {
        $input.attr('placeholder', placeholder);
    }

    /**
     * 用户登录
     * @param username
     * @param password
     */
    function login(username: string, password: string) {
        let $inputs = $('#loginPanel').find('input');
        //如果勾选了记住密码
        if ($('#rememberAccount').is(':checked')) {
            storageAccount(username, password);
        }

        userApi.login(username, password).then(res => {
            const { code } = res;
            switch (code) {
                case 200:
                    const { power, token } = res.data;
                    //判断是否有权限
                    if (power !== 1) {
                        localStorage.setItem("token", token);
                        localStorage.setItem("username", username);
                        window.location.href = 'admin';
                    } else {
                        amModal.alert("登录失败,没有权限");
                    }
                    break;
                //登录失败
                case 20010:
                    $inputs.eq(0).val('');
                    resetPlaceHolder($inputs.eq(0), "用户不存在");
                    changeInputGroupColor($inputs.eq(0).parent(), themeColor.danger);
                    break;
                case 20011:
                    $inputs.eq(1).val('');
                    resetPlaceHolder($inputs.eq(1), "密码错误");
                    changeInputGroupColor($inputs.eq(1).parent(), themeColor.danger);
                    break;
                default:
                    break;
            }
        })
    }

    /**
     * 判断字符串是否为空
     * @param str
     * @returns {boolean}
     */
    function isEmpty(str: string) {
        return (str === null || str.trim() === '' || str === undefined);
    }

    /**
     * 切换Amazeui中输入框组的颜色
     * @param {Object} $group 输入框对象
     * @param {String} color 颜色/success/danger/secondary/default/primary
     */
    function changeInputGroupColor($group: JQuery<HTMLElement>, color: themeColor) {
        var colors = Object.keys(themeColor);
        for (const key of colors) {
            $group.removeClass('am-input-group-' + key);
        }
        $group.addClass('am-input-group-' + color);
    }

    /**
     * 本地存储账号信息
     */
    function storageAccount(username: string, password: string) {
        localStorage.setItem("user", JSON.stringify({ "username": username, "password": password }));
    }

    /**
     * 加载最后一次存储的账号信息
     */
    function loadLocatAccount() {
        let nowUser = localStorage.getItem("user");
        if (!nowUser) {
            return;
        }
        try {
            const { username, password } = JSON.parse(nowUser);
            $('#login-username').val(username);
            $('#login-password').val(password);
        } catch (err) {
            localStorage.removeItem("user")
        }
        if (localStorage.getItem('token')) {
            window.location.href = 'admin'
        }
    }

})