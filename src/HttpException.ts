export class HttpException extends Error{
    constructor(message : string | any, statusCode : number) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
    name : string = "HttpException";
    message : string;
    statusCode : number;
}
