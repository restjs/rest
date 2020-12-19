import 'reflect-metadata';

import {InjectDecoratorKey} from "../constants";

export function Inject() {
    return function (target : Object, key : string) {
        const propType = Reflect.getMetadata('design:type', target, key);
        const previousKeys = Reflect.getMetadata(InjectDecoratorKey, target) || [];
        previousKeys.push({prop : key, type : propType});
        Reflect.defineMetadata(InjectDecoratorKey, previousKeys, target);
    }
}
