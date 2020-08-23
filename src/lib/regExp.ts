/**
 * 最简单的11位手机号
 */
export const rMobile = /^1\d{10}$/

/**
 * 验证码格式
 */
export const rCode = /^\d{4}$/

/**
 * 密码格式
 */
export const rPassword = /^[0-9a-zA-Z@#$%]{6,16}$/

/**
 * 账号格式
 */
export const rUsername = /^[\w@.\u4e00-\u9fa5]{1,17}$/