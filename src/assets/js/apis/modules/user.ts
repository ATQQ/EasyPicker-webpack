import ajax from '../ajax'

interface LoginData {
    power: number,
    token: string
}

/**
 * 账号登录
 * @param username 用户名
 * @param password 密码
 */
function login(username: string, password: string) {
    return ajax.post<any, BaseResponse<LoginData>>('user/login', {
        username,
        password
    })
}

/**
 * 获取验证码
 * @param mobile 手机号
 */
function getCode(mobile: string) {
    return ajax.get<any, BaseResponse>('user/getCode', {
        params: {
            mobile
        }
    })
}

/**
 * 密码重置
 * @param mobile 手机号
 * @param password 新密码
 * @param code 验证码
 */
function resetPassword(mobile: string, password: string, code: string) {
    return ajax.put<any, BaseResponse>(`user/update/${code}`, {
        mobile,
        password
    })
}

/**
 * 注册账号
 * @param username 用户名
 * @param password 密码
 * @param mobile 手机号
 * @param code 验证码
 */
function register(username: string, password: string, mobile?: string, code?: string) {
    const urlPath = 'user/user'
    const data = {
        username,
        password
    }
    if (mobile) {
        Object.assign(data, {
            mobile,
            code
        })
    }
    return ajax.post<any, BaseResponse>(urlPath, data)
}
export default {
    login,
    getCode,
    resetPassword,
    register
}