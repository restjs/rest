# What is Rest-JS?

Rest-JS is a simple and lightweight framework heavily inspired by Nest-JS framework to build Node-JS applications in some simple steps. 

Rest-JS implements some common design patterns like : MVC, Dependency Injection (DI), Pipelines, Interceptors and etc. It also uses OOP (Object-oriented programming) and FP(functional programming) to make sure you'll build performant and scalable server-side applications. 

You can deploy your NodeJS server using JSX syntax like this : 
```
import React from 'react';
import {Application, Router, Get} from '@restjs/core';
import MainController from './controllers/MainController';

const app : React.ReactElement = (
    <Application
        onListen={()=>{
            console.log('Rest-JS app is running on : http://localhost:3000');
        }}
    >
        <Router path="/" controller={MainController}>
            <Get path="/" handle="index"/>
        </Router>
    </Application>
)

Application.run(app);
```


# Prerequisites

Before start working with Rest-JS, please make sure you know some basics about the mentioned technologies :

1 - NodeJS (https://nodejs.org)

2 - ReactJS (https://reactjs.org)

3 - ExpressJS (https://expressjs.com/)

4 - Typescript (https://www.typescriptlang.org)
# Quick start
There's a few configuration steps to run your Node-js application.

Read full documentation at our official github page : 

https://restjs.github.io

## Clone the starter git repository
First you have to clone the restjs-starter repository by using git to configure your project quickly.

`git clone https://github.com/restjs/restjs-starter.git`

Then navigate to your project's source : 

`cd ./restjs-starter`

## Install packages
Use the npm package manager to install the rest's dependencies, by using this command : 

`npm install`


## Run your server
Your project is ready to be served.
So run `npm run dev` to start the development server.

If you do these steps, then you should see a message on the terminal like this : 

`Rest-JS app is running on : http://localhost:3000`

Then open `http://localhost:3000` on your browser to see a text like this :
 
 **Welcome to Rest-JS framework!!!**.

Congratulations, you've configured your server successfully!!!

We'll discuss the project's structure in the next section.

## Project structure
If you take a look at on your project structure, you'll see some folders and files :

1 - **node_modules** : your project's dependencies and modules that npm will provide it for you, every time you install a package or run `npm install`.

2 - **src** : This folder is your project's source folder, this means you have to write your codes here.

3 - **.gitignore** : This file tells git to ignore some files or folders that you don't want to be commit in your source code. 

4 - **package.json** : This file describes your project dependencies that npm will use it to install the modules and some more usages.

5 - **tsconfig.json** : As you know Rest-JS is written by Typescript, and it uses Typscript's compiler to compile your source code, so this file is a configuration file for compiling your project's source code.

## ./src/main.tsx
In your IDE please open this file : `/src/main.tsx`
This file is your application entry point, and you can define your routers here.
```
import React from 'react';
import {Application, Router, Get} from '@restjs/core';
import MainController from "./controllers/MainController";

const app : React.ReactElement = (
    <Application
        onListen={()=>{
            console.log('Rest-JS app is running on : http://localhost:3000');
        }}
    >
        <Router path="/" controller={MainController}>
            <Get path="/" handle="index"/>
        </Router>
    </Application>
)

Application.run(app);
```
In the first line you can see we've used React library to use the JSX syntax in our code .

In the second line **Application, Router, Get** are imported from `@restjs/core`, these three actually are the react components that implements routing system by using express-js package.

> Notice : the **Application** class is a class that extends **React.Component**, it also has a static method called `run` to execute your application 

You can even change the default port or host of the **Application** like this : 

```
import React from 'react';
import {Application, Router, Get} from '@restjs/core';
import MainController from "./controllers/MainController";

const app : React.ReactElement = (
    <Application
        port={80}
        host="127.0.0.1"
        onListen={()=>{
            console.log('Rest-JS app is running on : http://localhost:3000');
        }}
    >
        <Router path="/" controller={MainController}>
            <Get path="/" handle="index"/>
        </Router>
    </Application>
)

Application.run(app);
```

Read full documentation at our official github page : 

https://restjs.github.io
