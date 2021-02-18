import axios from 'axios'

import { amModal, redirectHome } from '@/lib/utils'
const instance = axios.create({
    baseURL: '/EasyPicker/',
})

/**
 * 请求拦截
 */
instance.interceptors.request.use((config) => {
    const { method, params } = config
    // 附带鉴权的token
    const headers = {
        token: localStorage.getItem('token')
    }
    // 不缓存get请求
    if ('get' === method) {
        headers['Cache-Control'] = 'no-cache'
    }
    // TODO ddl: 2020-09-30 传入的data不明原因消失，固先放入params
    // delete请求参数放入body中
    if ('delete' === method) {
        headers['Content-type'] = 'application/json;'
        config.data = params
        config.params = {}
    }

    return ({
        ...config,
        headers
    })
})

/**
 * 响应拦截
 */
instance.interceptors.response.use(v => {
    if (v.data?.code === 401) {
        localStorage.removeItem('token')
        amModal.alert('即将跳转登录页。。。', '登录过期')
        setTimeout(redirectHome, 1500)
        return v.data
    }
    if (v.status === 200) {
        return v.data
    }
    amModal.alert(v.statusText, '网络错误')
    return Promise.reject(v)
})
export default instance