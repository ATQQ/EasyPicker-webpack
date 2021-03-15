import ajax from '../ajax'


function getList(parent: string, child: string, username: string) {
    return ajax.get<any, BaseResponse<PeopleData[]>>('people/peopleList', {
        params: {
            parent,
            child,
            username
        },
        baseURL: '/server2'
    })
}

function checkIsLimited(username: string, parent: string, child: string, name: string) {
    return ajax.get<any, BaseResponse>('people/people', {
        params: {
            username,
            parent,
            child,
            name
        },
        baseURL: '/server2'
    })
}

function deletePeople(id: number) {
    return ajax.delete<any, BaseResponse>('people/people', {
        params: {
            id
        },
        baseURL: '/server2'
    })
}
export default {
    getList,
    checkIsLimited,
    deletePeople,
}