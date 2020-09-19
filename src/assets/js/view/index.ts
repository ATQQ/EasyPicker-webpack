//引入样式
import '../../sass/modules/index.scss'

import { userApi } from 'apis/index'
import { rMobile, rCode, rPassword, rUsername } from '@/lib/regExp'
import jqUtils from '@/lib/jqUtils'
import { themeColor } from '@/lib/enums'
import { placeholders,amModal } from '@/lib/utils'

import('./../common/tongji').then(res=>{
    res.default.init()
})

$(document).ready(function () {
    let isGetCode = false
    /**
     * 页面初次完成渲染后
     */
    loadLocatAccount()

    /**
     * 输入框内容发生改变时，改变展示的背景色
     */
    $('input').on('change', function (e) {
        const { id, value } = e.currentTarget as HTMLInputElement
        // 不处理注册框的手机号绑定框
        if (id === 'userMobile') {
            return
        }
        // 不为空则恢复原色（蓝色）
        if (value) {
            changeInputGroupColor($(this).parent(), themeColor.secondary)
        }
    })

    let yzTimes = 90 // 注册框验证码时间
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
            changeInputGroupColor($inputGroup, themeColor.secondary)
            return
        }
        // 手机号无效
        jqUtils.freezeBtn($getCode)
        changeInputGroupColor($inputGroup, themeColor.danger)
    })

    let yzTimes2 = 90 //重置密码验证码等待时间
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
            changeInputGroupColor($inputGroup, themeColor.secondary)
            return
        }

        jqUtils.freezeBtn($getForgetCode)
        changeInputGroupColor($inputGroup, themeColor.danger)
    })

    /**
     * 忘记密码获取验证码
     */
    $('#getForgetCode').on('click', function (e) {
        const $getForgetCode = $(this)
        const fun = function () {
            $getForgetCode.html(--yzTimes2 + '(s)')
            if (yzTimes2 === 0) {
                yzTimes2 = 90
                jqUtils.unFreezeBtn($getForgetCode)
                $getForgetCode.html('获取验证码')
                return
            }
            setTimeout(fun, 1000)
        }

        const mobile = $getForgetCode.parent().parent().prev().find('input').val() as string

        if (!rMobile.test(mobile)) {
            return
        }

        userApi.getCode(mobile).then(res => {
            if (res.code === 200) {
                jqUtils.freezeBtn($getForgetCode)
                //开始执行
                fun()
            } else {
                amModal.alert(res.errMsg)
            }
        })
    })

    /**
     * 确认重置密码
     */
    $('#sureReset').on('click', function () {
        const $sureReset = $(this)
        const $inputs = $('#forgetPanel').find('input')
        const phoneNumber = $inputs.eq(0).val() as string //手机号
        const code = $inputs.eq(1).val() as string //验证码
        const newPwd = $inputs.eq(2).val() as string //新密码
        const reserInputByIndex = getResetPlaceHolderArr($inputs)
        if (!rMobile.test(phoneNumber)) {
            reserInputByIndex(0, placeholders.mobile.errFormat)
            return
        }
        if (!rCode.test(code)) {
            reserInputByIndex(1, placeholders.code.errFormat)
            return
        }
        if (!rPassword.test(newPwd)) {
            reserInputByIndex(2, placeholders.password.errFormat)
            return
        }

        userApi.resetPassword(phoneNumber, newPwd, code).then(res => {
            switch (res.code) {
            case 20023:
                reserInputByIndex(1, placeholders.code.notMatch)
                break
            case 200:
                $sureReset.next().click()
                amModal.alert('重置成功')
                yzTimes2 = 1
                break
            case 20020:
                reserInputByIndex(1, placeholders.code.notRight)
                break
            case 20014:
                reserInputByIndex(0, placeholders.mobile.notExist)
                break
            case 20012:
                reserInputByIndex(0, placeholders.mobile.alreadyExist)
                break
            default:
                amModal.alert('未知异常,请联系管理员')
                break
            }
        })
    })

    /**
     * 是否开启绑定手机号的面板
     */
    $('#isBindMobile').on('change', function (e) {
        const $getCodePanel = $(this).parent().prev()
        if ($(this).is(':checked')) {
            $getCodePanel.removeAttr('readonly').parent().next().show()
            return
        }
        $getCodePanel.attr('readonly', 'readonly').parent().next().hide()
    })

    /**
     * 用户登录
     */
    $('#login').on('click', function () {
        const $inputs = $('#loginPanel').find('input')
        const username = $inputs.eq(0).val() as string
        const pwd = $inputs.eq(1).val() as string
        const reserInputByIndex = getResetPlaceHolderArr($inputs)
        if (!rUsername.test(username)) {
            reserInputByIndex(0, placeholders.username.errFormat)
            return
        }
        if (!rPassword.test(pwd)) {
            reserInputByIndex(1, placeholders.password.errFormat)
            return
        }
        login(username, pwd)
    })


    /**
     * 新用户注册获取验证码
     */
    $('#getCode').on('click', function () {
        const $getCode = $(this)
        const fun = function () {
            $getCode.html(--yzTimes + '(s)')
            if (yzTimes === 0) {
                yzTimes = 90
                jqUtils.unFreezeBtn($getCode)
                $getCode.html('获取验证码')
                return
            }
            setTimeout(fun, 1000)
        }

        const mobile = $(this).parent().parent().prev().find('input').val() as string
        userApi.getCode(mobile).then(res => {
            if (res.code === 200) {
                jqUtils.freezeBtn($getCode)
                //开始执行
                fun()
                isGetCode = true
            } else {
                amModal.alert(res.errMsg)
            }
        })
    })

    /**
     * 确认新用户注册
     */
    $('#register').on('click', function () {
        const $registerBtn = $(this)
        const $inputs = $('#registerPanel').find('input')
        const username = $inputs.eq(0).val() as string
        const pwd1 = $inputs.eq(1).val() as string //第一次密码
        const pwd2 = $inputs.eq(2).val() as string //第二次密码
        let mobile = $inputs.eq(3).val() as string //手机号
        let code = $inputs.eq(5).val() as string //验证码
        const reserInputByIndex = getResetPlaceHolderArr($inputs)

        //判断账号是否符合条件
        if (!rUsername.test(username)) {
            reserInputByIndex(0, placeholders.username.errFormat)
            return
        }
        if (!rPassword.test(pwd1)) {
            reserInputByIndex(1, placeholders.password.errFormat)
            return
        }
        if (pwd1 != pwd2) {
            reserInputByIndex(2, placeholders.password.twoDiff)
            return
        }

        //判断是否需要绑定手机号
        if ($('#isBindMobile').is(':checked')) {
            //判断手机号
            if (!rMobile.test(mobile)) {
                reserInputByIndex(3, placeholders.mobile.errFormat)
                return
            }
            //判断验证码
            if (!rCode.test(code)) {
                reserInputByIndex(5, placeholders.code.errFormat)
                return
            }
        } else {
            mobile = ''
            code = ''
        }

        userApi.register(username, pwd1, mobile, code).then(res => {
            const { code } = res
            switch (code) {
            case 200:
                amModal.alert('注册成功')
                $('input').val('')
                $registerBtn.next().click()
                isGetCode = false
                break
            case 20013:
                reserInputByIndex(0, placeholders.username.alreadyExist)
                break
            case 20012:
                reserInputByIndex(3, placeholders.mobile.alreadyExist)
                break
            case 20020:
                reserInputByIndex(5, placeholders.code.notRight)
                break
            default:
                break
            }
        })
    })

    /**
     * 初始化面板数据
     */
    function resetInputPlaceholder() {
        const $inputs = $('#registerPanel').find('input')
        resetPlaceHolder($inputs.eq(0), '请输入注册账号')
        resetPlaceHolder($inputs.eq(1), '请输入密码')
        resetPlaceHolder($inputs.eq(2), '请再次输入密码')
        resetPlaceHolder($inputs.eq(3), '(可选)绑定手机号')
        resetPlaceHolder($inputs.eq(5), '输入验证码')
        isGetCode = false
    }

    /**
     * 切换登录/注册面板/忘记密码面板
     */
    $('.changePanel').on('click', function () {
        $('div.homePanel').hide() //隐藏全部
        const panelKey = $(this).attr('targetPanel')
        $('div.homePanel[panel="' + panelKey + '"]').addClass('flipInY').show()
        resetInputPlaceholder()
    })

    /**
     * 重置输入框placeHolder内容
     * @param {input} $input
     * @param {String} placeholder
     */
    function resetPlaceHolder($input: JQuery<HTMLElement>, placeholder: string) {
        $input.attr('placeholder', placeholder)
    }

    /**
     * 获取一个方法来重置指定￥input的placeholder
     * @param $inputs 多个输入框
     */
    function getResetPlaceHolderArr($inputs: JQuery<HTMLInputElement>) {
    /**
         * 修改目标$input的placeholder且初始化值
         * @param index 下标
         * @param placeholder 提示内容
         * @param themeColor 颜色 
         */
        function resetByIndex(index: number, placeholder: string, color = themeColor.danger) {
            const $input = $inputs.eq(index)
            $input.val('')
            resetPlaceHolder($input, placeholder)
            if (color) {
                changeInputGroupColor($input.parent(), color)
            }
        }

        return resetByIndex
    }
    /**
     * 用户登录
     * @param username
     * @param password
     */
    function login(username: string, password: string) {
        const $inputs = $('#loginPanel').find('input')
        const reserInputByIndex = getResetPlaceHolderArr($inputs)
        
        //如果勾选了记住密码
        if ($('#rememberAccount').is(':checked')) {
            storageAccount(username, password)
        }

        userApi.login(username, password).then(res => {
            const { code } = res
            switch (code) {
            case 200:
                const { power, token } = res.data
                //判断是否有权限
                if (power !== 1) {
                    localStorage.setItem('token', token)
                    localStorage.setItem('username', username)
                    window.location.href = 'admin'
                } else {
                    amModal.alert('登录失败,没有权限')
                }
                break
                //登录失败
            case 20010:
                reserInputByIndex(0,placeholders.username.notExist)
                break
            case 20011:
                reserInputByIndex(1,placeholders.password.notRight)
                break
            default:
                break
            }
        })
    }

    /**
     * 切换Amazeui中输入框组的颜色
     * @param {Object} $group 输入框对象
     * @param {String} color 颜色/success/danger/secondary/default/primary
     */
    function changeInputGroupColor($group: JQuery<HTMLElement>, color: themeColor) {
        const colors = Object.keys(themeColor)
        for (const key of colors) {
            $group.removeClass('am-input-group-' + key)
        }
        $group.addClass('am-input-group-' + color)
    }

    /**
     * 本地存储账号信息
     */
    function storageAccount(username: string, password: string) {
        localStorage.setItem('user', JSON.stringify({ username, password }))
    }

    /**
     * 加载最后一次存储的账号信息
     */
    function loadLocatAccount() {
        const nowUser = localStorage.getItem('user')
        if (!nowUser) {
            return
        }
        try {
            const { username, password } = JSON.parse(nowUser)
            $('#login-username').val(username)
            $('#login-password').val(password)
        } catch (err) {
            localStorage.removeItem('user')
        }
        if (localStorage.getItem('token')) {
            window.location.href = 'admin'
        }
    }

})