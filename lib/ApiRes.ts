export class ApiRes {

    constructor(code: number, msg: string, data: any) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    code: number;
    msg: string;
    data: any;

    public static success(data: any) {
        return new ApiRes(200, 'success', data);
    }

    public static error(msg: string) {
        return new ApiRes(500, msg, null);
    }

}