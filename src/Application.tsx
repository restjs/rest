import React from "react";
import express, {Application as ExpressApplication} from 'express';
import {Router} from "./Router";
import ReactDOMServer from "react-dom/server";
import bodyParser from "body-parser";

interface IAppProps {
    app? : ExpressApplication,
    port? : number,
    host? : string,
    onListen? : ()=>void,
}
export class Application extends React.Component<IAppProps, any>{
    app : ExpressApplication;

    constructor(props) {
        super(props);
        if(props.app){
            this.app = props.app;
        }else{
            this.app = express();
            this.app.use(bodyParser.urlencoded({ extended: false }));
            this.app.use(bodyParser.json());
        }
    }


    public static run(app : React.ReactElement<Application>){
        if(app.type == Application){
            ReactDOMServer.renderToString(app);
        }else{
            throw new Error('Argument "app" must be an instance of the Application class.');
        }
    }

    render() {
        const children = React.Children.map(this.props.children, (child:React.ReactElement)=>{
            if(child.type == Router){
                const router = express.Router();
                this.app.use(child.props.path, router);
                return <Router {...child.props} __router_instance={router}/>
            }
        });
        this.app.listen(this.props.port || 3000, this.props.host, this.props.onListen);
        return children;
    }
}
