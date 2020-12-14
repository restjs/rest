import {validate} from "class-validator";
import {HttpException} from "./HttpException";

export interface ValidatorOptions {
    query ? : any;
    body ? : any;
    params ? : any;
    skipMissingProperties?: boolean;
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    groups?: string[];
    dismissDefaultMessages?: boolean;
    validationError?: {
        target?: boolean;
        value?: boolean;
    };

    forbidUnknownValues?: boolean;
}

export default class ValidationPipe {
    params;
    async use(req){
        const {body,query,params,...options} = this.params;
        for(const param in this.params){
            if(param == "body" || param == "query" || param == "params"){
                const dto = new this.params[param];
                if(Object.keys(req[param]).length > 0){
                    for(const field in req[param]){
                        dto[field] = req[param][field];
                    }
                }
                const errors = await validate(dto, options);
                if(errors.length > 0 ){
                    let messages = [];
                    errors.forEach(error=>{
                        Object.values(error.constraints).forEach(e=>messages.push(e));
                    })
                    throw new HttpException(messages, 400);
                }
            }
        }
    }
}
