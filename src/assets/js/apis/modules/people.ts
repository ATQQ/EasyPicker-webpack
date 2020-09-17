import ajax from '../ajax'

interface PeopleData {
    id: number,
    name: string,
    status: number,
    date: number
}

function getList(parent: string, child: string, username: string) {
    return ajax.get<any, BaseResponse<PeopleData[]>>('people/peopleList', {
        params: {
            parent,
            child,
            username
        }
    })
}
export default {
    getList
}