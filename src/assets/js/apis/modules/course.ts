import ajax from '../ajax'

interface Course {
    name: string,
    id: number
}
function getCourseList(range: string, contentid: number, username: string): Promise<BaseResponse<{ courseList: Course[] }>> {
    return ajax.get<any, BaseResponse<{ courseList: Course[] }>>('course/check', {
        params: {
            range,
            contentid,
            username
        },
        baseURL: '/server2'
    })
}

interface AddCourseStatus extends Course {
    status: boolean
}
function addCourse(name: string, type: number, parent: string, username: string): Promise<BaseResponse<AddCourseStatus>> {
    return ajax.put<any, BaseResponse<AddCourseStatus>>('course/add', {
        name,
        type,
        parent,
        username
    }, {
        baseURL: '/server2'
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

function getCourseNode(username: string): Promise<BaseResponse<CourseList>> {
    return ajax.get<any, BaseResponse<CourseList>>('course/node', {
        params: {
            username
        },
        baseURL:'/server2'
    })
}

function getNodeList(type: number, username: string, parent: string, child?: string) {
    const data = {
        type,
        parent,
        username,
    }
    if (child) {
        data['child'] = child
    }
    return ajax.get<any, BaseResponse>('course/course', {
        params: data,
        baseURL:'/server2'
    })
}

function deleteCourse(id: number, type: number) {
    return ajax.delete<any, BaseResponse>('course/del', {
        params: {
            id,
            type
        },
        baseURL: '/server2'
    })
}
export default {
    getCourseList,
    addCourse,
    getCourseNode,
    getNodeList,
    deleteCourse
}