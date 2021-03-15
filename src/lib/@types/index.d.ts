type dateFormat = (fmt: string) => string

interface PeopleData {
    id: number,
    name: string,
    status: number,
    date: number
}

interface Date {
    Format: dateFormat
}
interface SuperFile {
    file: File,
    status: number,
    id: string,
    filename?: string
}

interface UploadParamData {
    username?: string,
    parent?: string,
    child?: string
}
interface JQuery {
    button: (status: string) => void,
    modal: (cf: any) => void,
    selected: (cf: any) => void,
}

interface Report {
    course: string,
    date: number,
    filename: string,
    id: number,
    name: string,
    tasks: string,
    username: string
}

interface BaseResponse<T = any> {
    code: number,
    errMsg: string,
    data: T
}

declare namespace qiniu {
    interface Subscription {
        close(): void
    }

    interface SubscriptionConfig {
        next(res): void,
        error(err): void,
        complete(res): void
    }
    interface Observable {
        subscribe(cf: SubscriptionConfig): Subscription
    }

    type upload = (file: File, key: string, token: string) => Observable
    const upload: upload
}

declare namespace WebUploader {
    interface Config {
        auto: boolean,
        swf: string,
        threads: number,
        server: string,
        method: string,
        pick: string,
        resize: boolean,
        accept?: {
            title: string,
            extensions: string,
            mimeTypes: string
        }
    }

    type create = (cf: Config) => any
    const create: create
}

interface JQuery {
    ECalendar(opts?: ECalendar.Settings): DataTables.Api;
}
declare namespace ECalendar {
    interface Settings {
        type: string,
        stamp: boolean, //回调函数value值格式 单位为秒
        skin: number,
        format: string,
        callback: (v: number) => void
    }
}