import ajax from '../ajax'

interface Params {
    ddl?: number | null,
    template?: string | null,
    people?: string | null

}

function update(taskid: string, type: number, config: Params): Promise<BaseResponse<any>> {
    const data = {
        taskid,
        type,
        ...config
    }
    return ajax.put<any, BaseResponse>('childContent/childContext', data)
}

interface TaskInfo {
    ddl: number,
    people: string,
    template: string
}

function getInitData(taskid: string) :Promise<BaseResponse<TaskInfo>>{
    return ajax.get<any, BaseResponse<TaskInfo>>('childContent/childContent', {
        params: {
            taskid
        }
    })
}

export default {
    update,
    getInitData
}