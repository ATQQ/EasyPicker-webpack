import ajax from '../ajax'

interface ReportsData {
    reportList: Report[]
}
function getReports(username: string) {
    return ajax.get<any, BaseResponse<ReportsData>>('report/report', {
        params: {
            username
        },
        baseURL: '/server2'
    })
}
function deleteByid(id: number) {
    return ajax.delete<any, BaseResponse>('report/report', {
        params: {
            id
        },
        baseURL: '/server2'
    })
}

function addReport(name: string, course: string, tasks: string, filename: string, username: string) {
    return ajax.post<any, BaseResponse>('report/save', {
        name,
        course,
        tasks,
        filename,
        username
    },
    { baseURL: '/server2' }
    )
}
export default {
    getReports,
    deleteByid,
    addReport
}