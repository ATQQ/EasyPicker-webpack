import axios from 'axios'

import { amModal } from '@/lib/utils'
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
        token: localStorage.getItem("token")
    }
    // 不缓存get请求
    if (method?.toLowerCase() === 'get') {
        headers['Cache-Control'] = 'no-cache'
    }
    return ({
        ...config,
        params,
        headers
    })
});

/**
 * 响应拦截
 */
instance.interceptors.response.use(v => {
    if (v.status === 200) {
        return v.data
    }
    amModal.alert(v.statusText, '网络错误')
    return Promise.reject(v)
})
export default instance