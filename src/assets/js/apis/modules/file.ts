import ajax from '../ajax'

function createZip(course: string, tasks: string, username: string) {
    const data = {
        course,
        tasks,
        username
    }
    return ajax.post<any, BaseResponse>('file/createZip', data)
}
export default {
    createZip
}