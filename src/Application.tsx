import React from "react";
import express, {Application as ExpressApplication} from 'express';
import {Router} from "./Router";
import ReactDOMServer from "react-dom/server";
import bodyParser from "body-parser";
import {v4 as uuid4} from "uuid";
import {Connection} from "typeorm";
import DatabaseException from "./DatabaseException";

interface IAppProps {
    app? : ExpressApplication,
    port? : number,
    host? : string,
    onListen? : ()=>void,
    database? : Connection;
}
export class Application<PropType> extends React.Component<IAppProps, any>{
    id : string;
    app : ExpressApplication;
    private static dbConnections : {[key:string] : Connection} = {};

    constructor(props : IAppProps) {
        super(props);
        this.id = uuid4();
        if(props.app){
            this.app = props.app;
        }else{
            this.app = express();
            this.app.use(bodyParser.urlencoded({ extended: false }));
            this.app.use(bodyParser.json());
        }
        if(this.props.database){
            Application.dbConnections[this.id] = this.props.database;
        }
    }


    public static run(app : React.ReactElement){
        if(app.type == Application){
            ReactDOMServer.renderToString(app);
        }else{
            throw new Error('Argument "app" must be an instance of the Application class.');
        }
    }


    private static createPath(path : string){
        if(path == undefined || !path){
            path = '/';
        }else if(typeof path == "string" && path.indexOf('/') != 0){
            path = '/' + path;
        }
        return path;
    }

    public static getRepository(appId : string, entity){
        if(!Application.dbConnections[appId]){
            throw new DatabaseException(`There's no database connection instance for entity : ${entity}\n. Please specify a database connection as a prop for the Application component.`);
        }
        return Application.dbConnections[appId].getRepository(entity);
    }

    render() {
        const children = React.Children.map(this.props.children, (child:React.ReactElement)=>{
            if(child.type == Router){
                const router = express.Router();
                this.app.use(Application.createPath(child.props.path), router);
                return <Router {...child.props} __router_instance={router} __AppId={this.id}/>
            }
        });
        this.app.listen(this.props.port || 3000, this.props.host, this.props.onListen);
        return children;
    }
}
