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
export default {
    getReports,
    deleteByid
}