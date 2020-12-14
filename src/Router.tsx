import React from "react";
import express, {Request, Response, Router as ExpressRouter} from "express";
import {Get, Post, Patch, Put, Delete} from "./Methods";
import path from "path";
import RouterException from "./RouterException";
import {HttpException} from "./HttpException";
import ValidationPipe, {ValidatorOptions} from "./ValidationPipe";
import {InjectDecoratorKey} from "./index";

type ShareClassObject = Array<{ _class : any, _instance : any }>;

enum METHOD{
    GET="GET",
    POST="POST",
    PATCH="PATCH",
    PUT="PUT",
    DELETE="DELETE",
}

export interface IRouter {
    path? : string;
    controller? : any;
    interceptors? : Array<any>;
    middlewares? : Array<any>;
    pipes? : Array<any>;
    services ? : Array<any>;
    validate? : ValidatorOptions;
    filters? : Array<any>;
    ignoreParentPipes? : boolean;
    ignoreParentInterceptors? : boolean;
    ignoreParentFilters? : boolean;
    ignoreParentServices ? : boolean;
}
export class Router extends React.Component<IRouter, any>{
    private controllers = {};
    private interceptors = {};
    private pipes = {};
    private filters = {};
    private services = {};

    private createPath(path : string){
        if(path == undefined || !path){
            path = '/';
        }else if(typeof path == "string" && path.indexOf('/') != 0){
            path = '/' + path;
        }
        return path;
    }

    private getPipe(pipe){
        let foundPipe = this.pipes[pipe];
        if(foundPipe){
            return foundPipe;
        }
        try{
            const pipeInstance = new pipe();
            this.injectDependencies(pipeInstance);
            this.pipes[pipe] = pipeInstance;
            return pipeInstance;
        }catch (e) {
            throw new RouterException(`Error on creating an instance of pipe class, please check your pipes to be a class.\n${e}`);
        }
    }

    private generatePipes(){
        //@ts-ignore
        if(this.props.__parent_pipes && !this.props.ignoreParentPipes){
            //@ts-ignore
            this.props.__parent_pipes.forEach((pipe)=>{
                this.pipes[pipe._class] = pipe._instance;
            })
        }

        if(this.props.pipes){
            this.props.pipes.forEach((pipe)=>{
                this.getPipe(pipe);
            })
        }
        if(this.props.validate){
            const validationPipe = new ValidationPipe();
            validationPipe.params = this.props.validate;
            //@ts-ignore
            this.pipes[ValidationPipe] = validationPipe;
        }
    }

    private async applyPipes(req : Request){
        for(const pipe in this.pipes){
            const pipeInstance = this.pipes[pipe];
            if(pipeInstance['use']){
                const pipeResult = pipeInstance['use'](req);
                if(pipeResult instanceof Promise){
                    await pipeResult;
                }
            }
        }
    }


    private getInterceptor(interceptor){
        let foundInterceptor = this.interceptors[interceptor];
        if(foundInterceptor){
            return foundInterceptor;
        }
        try{
            const interceptorInstance = new interceptor();
            this.injectDependencies(interceptorInstance);
            this.interceptors[interceptor] = interceptorInstance;
            return interceptorInstance;
        }catch (e) {
            throw new RouterException(`Error on creating an instance of interceptor class, please check your interceptors to be a class.\n${e}`);
        }
    }

    private generateInterceptors(){
        //@ts-ignore
        if(this.props.__parent_interceptors && !this.props.ignoreParentInterceptors){
            //@ts-ignore
            this.props.__parent_interceptors.forEach((interceptor)=>{
                this.interceptors[interceptor._class] = interceptor._instance;
            })
        }
        if(this.props.interceptors){
            this.props.interceptors.forEach((interceptor)=>{
                this.getInterceptor(interceptor);
            })
        }
    }

    private async applyInterceptorsIn(req : Request, res : Response){
        for(const interceptor in this.interceptors){
            const interceptorInstance = this.interceptors[interceptor];
            if(interceptorInstance['in']){
                let interceptorResult = interceptorInstance['in'](req,res);
                if(interceptorResult instanceof Promise){
                    interceptorResult = await interceptorResult;
                }
                if(!interceptorResult)
                    return false;
            }
        }
        return true;
    }

    private async applyInterceptorsOut(message){
        for(const interceptor in this.interceptors){
            const interceptorInstance = this.interceptors[interceptor];
            if(interceptorInstance['out']){
                const interceptorResult = interceptorInstance['out'](message);
                if(interceptorResult instanceof Promise){
                    message = await interceptorResult;
                }else{
                    message = interceptorResult;
                }
            }
        }
        return message;
    }

    private getFilter(filter){
        let foundFilter = this.filters[filter];
        if(foundFilter){
            return foundFilter;
        }
        try{
            const filterInstance = new filter();
            this.injectDependencies(filterInstance);
            this.filters[filter] = filterInstance;
            return filterInstance;
        }catch (e) {
            throw new RouterException(`Error on creating an instance of filter class, please check your filters to be a class.\n${e}`);
        }
    }

    private generateFilters(){
        //@ts-ignore
        if(this.props.__parent_filters && !this.props.ignoreParentFilters){
            //@ts-ignore
            this.props.__parent_filters.forEach((filter)=>{
                this.filters[filter._class] = filter._instance;
            })
        }

        if(this.props.filters){
            this.props.filters.forEach((filter)=>{
                this.getFilter(filter);
            })
        }
    }

    private getService(service){
        let foundService = this.services[service];
        if(foundService){
            return foundService;
        }
        try{
            const serviceInstance = new service();
            this.services[service] = serviceInstance;
            this.injectDependencies(serviceInstance);
            return serviceInstance;
        }catch (e) {
            throw new RouterException(`Error on creating an instance of service class, please check your services to be a class.\n${e}`);
        }
        return null;
    }

    private generateServices(){
        //@ts-ignore
        if(this.props.__parent_services && !this.props.ignoreParentServices){
            //@ts-ignore
            this.props.__parent_services.forEach((service)=>{
                this.services[service._class] = service._instance;
            })
        }
        if(this.props.services){
            this.props.services.forEach((service)=>{
                this.getService(service);
            })
        }
    }

    private injectDependencies(instance){
        const metaData = Reflect.getMetadata(InjectDecoratorKey, instance);
        if(metaData && metaData instanceof Array){
            metaData.forEach((meta)=>{
                const service = this.services[meta.type];
                if(service){
                    instance[meta.prop] = service;
                }
            })
        }
    }


    render() {
        if(this.props.hasOwnProperty("__router_instance")){
            this.generateServices();
            this.generatePipes();
            this.generateInterceptors();
            this.generateFilters();
            //@ts-ignore
            const routerInstance : ExpressRouter = this.props.__router_instance;

            return React.Children.map(this.props.children, (child: Get)=>{
                const routerPath = this.createPath(this.props.path);
                const childPath = this.createPath(child.props.path);
                let handlerName;
                let controller;
                let method;

                if(child.type == Router){
                    const router = express.Router();
                    routerInstance.use(childPath, router);

                    let pipes : ShareClassObject;
                    let interceptors : ShareClassObject;
                    let filters : ShareClassObject;
                    let services : ShareClassObject;
                    if(!child.props.ignoreParentPipes){
                        pipes = [];
                        Object.keys(this.pipes).forEach((pipe)=>{
                            pipes.push({_class : pipe, _instance : this.pipes[pipe]});
                        })
                    }
                    if(!child.props.ignoreParentInterceptors){
                        interceptors = [];
                        Object.keys(this.interceptors).forEach((interceptor)=>{
                            interceptors.push({_class : interceptor, _instance : this.interceptors[interceptor]});
                        })
                    }
                    if(!child.props.ignoreParentFilters){
                        filters = [];
                        Object.keys(this.filters).forEach((filter)=>{
                            filters.push({_class : filter, _instance : this.filters[filter]});
                        })
                    }
                    if(!child.props.ignoreParentServices){
                        services = [];
                        Object.keys(this.services).forEach((service)=>{
                            services.push({_class : service, _instance : this.services[service]});
                        })
                    }
                    //@ts-ignore
                    return <Router {...child.props} __router_instance={router}
                                   __parent_pipes={pipes}
                                   __parent_interceptors={interceptors}
                                   __parent_filters={filters}
                                   __parent_services={services}
                    />;
                }

                switch (child.type) {
                    case Get : method = METHOD.GET; break;
                    case Post : method = METHOD.POST; break;
                    case Patch : method = METHOD.PATCH; break;
                    case Put : method = METHOD.PUT; break;
                    case Delete : method = METHOD.DELETE; break;
                }

                if(child.props.controller){
                    controller = child.props.controller;
                }else if(this.props.controller){
                    controller = this.props.controller;
                }else{
                    throw new RouterException(`Please set a valid controller for route : ${path.join(routerPath, childPath)} (${method})`);
                }

                let controllerInstance;
                if(!this.controllers[controller]){
                    this.controllers[controller] = new controller();
                }

                controllerInstance = this.controllers[controller];
                this.injectDependencies(controllerInstance);

                if(child.props.handle){
                    handlerName = child.props.handle;
                }else{
                    throw new RouterException(`Please set handle option for router : ${path.join(routerPath, childPath)} (${method})`);
                }

                if( method && !controllerInstance[handlerName] ){
                    throw new RouterException(
                        `There is no such method as "${handlerName}" in the "${controller.name}" controller : ${path.join(routerPath, childPath)} (${method})`
                    );
                }

                let handlers = [async (req,res,next)=>{
                    let passed : boolean = false;
                    try{
                        await this.applyPipes(req);
                        passed = await this.applyInterceptorsIn(req,res);
                    }catch (e) {
                        await this.handleErrors(e, res);
                        return;
                    }
                    if(passed)
                        next();
                }] ;

                if(this.props.middlewares && Array.isArray(this.props.middlewares) && this.props.middlewares.length > 0){
                    this.props.middlewares.forEach(middleware=>{
                        handlers.push(async (req,res,next)=>{
                            try{
                                middleware(req,res,next);
                            }catch (e) {
                                await this.handleErrors(e,res);
                            }
                        });
                    })
                }
                if(method){
                    if(child.props.validate){
                        handlers.push(async (req,res,next)=>{
                            try{
                                const pipeInstance = new ValidationPipe();
                                pipeInstance.params = child.props.validate;
                                const pipeResult = pipeInstance['use'](req);
                                if(pipeResult instanceof Promise){
                                    await pipeResult;
                                }
                                next();
                            }catch (e) {
                                await this.handleErrors(e,res);
                            }
                        })
                    }

                    handlers.push( async (req: Request, res: Response)=>{
                        try{
                            const result = controllerInstance[handlerName](req,res);
                            if(result == undefined)
                                return;

                            let outMessage;
                            if(result instanceof Promise){
                                outMessage = await result;
                            }else{
                                outMessage = result;
                            }
                            if(Object.keys(this.interceptors).length > 0){
                                outMessage = await this.applyInterceptorsOut(outMessage);
                            }
                            if(!outMessage || typeof outMessage == 'string')
                                res.status(200).send(outMessage);
                            else
                                res.status(200).json(outMessage);

                        }catch (e) {
                            await this.handleErrors(e, res);
                        }
                    });
                }

                switch (method) {
                    case METHOD.GET : routerInstance.get(childPath, ...handlers ); break;
                    case METHOD.POST : routerInstance.post(childPath, ...handlers ); break;
                    case METHOD.PATCH : routerInstance.patch(childPath, ...handlers ); break;
                    case METHOD.PUT : routerInstance.put(childPath, ...handlers ); break;
                    case METHOD.DELETE : routerInstance.delete(childPath, ...handlers ); break;
                }


                return null;
            });
        }
        return '';
    }

    private async handleErrors(e, res){
        const name = e["name"];
        switch (name) {
            case "HttpException" :
                let filterOut:any = {message : e.message, statusCode : e.statusCode};
                for(const filter in this.filters){
                    const filterInstance = this.filters[filter];
                    if(filterInstance['catch']){
                        let filterResult = filterInstance['catch'](e.message, e.statusCode);
                        if(filterResult instanceof Promise){
                            filterResult = await filterResult;
                        }
                        if(filterResult){
                            filterOut = filterResult;
                            if(filterOut.hasOwnProperty("out")){
                                if(filterOut.out == true || filterOut.out == "json"){
                                    res.status(e.statusCode).json(filterOut);
                                    return;
                                }
                                if(filterOut.out == "text"){
                                    res.status(e.statusCode).send(filterOut.message);
                                    return;
                                }
                            }
                        }
                    }
                }
                res.status(e.statusCode).json(filterOut);
                return;
        }
        throw new Error(e);
    }
}
