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

interface AddCourseStatus extends Course {
    status: boolean
}
function addCourse(name: string, type: number, parent: string, username: string) {
    return ajax.put<any, BaseResponse<AddCourseStatus>>('course/add', {
        name,
        type,
        parent,
        username
    })
}

interface Course {
    id: number,
    parent: number,
    name: string,
    type: number,
    username: string
}
interface CourseList {
    courseList: Course[]
}

function getCourseNode(username: string) {
    return ajax.get<any, BaseResponse<CourseList>>('course/node', {
        params: {
            username
        }
    })
}

function getNodeList(type: number, username: string, parent: string, child?: string) {
    let data = {
        type,
        parent,
        username,
    }
    if (child) {
        data['child'] = child
    }
    return ajax.get<any, BaseResponse>('course/course', {
        params: data
    })
}

function deleteCourse(id: number, type: number) {
    return ajax.delete<any, BaseResponse>('course/del', {
        params: {
            id,
            type
        }
    })
}
export default {
    getCourseList,
    addCourse,
    getCourseNode,
    getNodeList,
    deleteCourse
}