import ajax from '../ajax'

interface Course {
    name: string,
    id: number
}
function getCourseList(range: string, contentid: number, username: string) {
    return ajax.get<any, BaseResponse<{ courseList: Course[] }>>('course/check', {
        params: {
            range,
            contentid,
            username
        }
    })
}
export default {
    getCourseList
}