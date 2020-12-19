import {validate, ValidatorOptions as ClassValidatorOptions} from "class-validator";
import {ClassTransformOptions, plainToClass} from "class-transformer";
import {HttpException} from "./HttpException";

export interface ValidatorOptions extends ClassValidatorOptions{
    query ? : any;
    body ? : any;
    params ? : any;
    transform? : boolean | ClassTransformOptions
}

export default class ValidationPipe {
    params : ValidatorOptions;
    async use(req){
        const {body,query,params,transform, ...options} = this.params;
        for(const prop in this.params){
            if(prop == "body" || prop == "query" || prop == "params"){
                let dto ;
                if(transform){
                    let transformOptions = {};
                    if(typeof transform == "object")
                        transformOptions = transform;
                    //@ts-ignore
                    dto = plainToClass(this.params[prop], req[prop], transformOptions);
                    req[prop] = dto;
                }else if(Object.keys(req[prop]).length > 0){
                    dto = new this.params[prop];
                    for(const field in req[prop]){
                        dto[field] = req[prop][field];
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
