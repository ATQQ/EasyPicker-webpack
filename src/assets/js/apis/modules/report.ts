import ajax from '../ajax'

interface ReportsData {
    reportList: Report[]
}
function getReports(username: string) {
    return ajax.get<any, BaseResponse<ReportsData>>('report/report', {
        params: {
            username
        }
    })
}
// TODO 待完善传参
function deleteByid(id: number) {
    return ajax.delete<any, BaseResponse>('report/report', {
        data: {
            data: {
                id
            }
        }
    })
}

function addReport(name: string, course: string, tasks: string, filename: string, username: string) {
    return ajax.post<any, BaseResponse>('report/save', {
        name,
        course,
        tasks,
        filename,
        username
    })
}
export default {
    getReports,
    deleteByid,
    addReport
}