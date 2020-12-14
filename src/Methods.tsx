import React from "react";
import {IRouter} from "./Router";
interface IGet extends IRouter{
    handle? : string;
}
interface IPost extends IGet{}
interface IPatch extends IGet{}
interface IPut extends IGet{}
interface IDelete extends IGet{}

export class Get extends React.Component<IGet, any>{type : any;}

export class Post extends React.Component<IPost, any>{type : any;}

export class Patch extends React.Component<IPatch, any>{type : any;}

export class Put extends React.Component<IPut, any>{type : any;}

export class Delete extends React.Component<IDelete, any>{type : any;}

