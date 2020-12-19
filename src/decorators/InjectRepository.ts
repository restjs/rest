import 'reflect-metadata';

import {InjectRepositoryKey} from "../constants";

export function InjectRepository(entity) {
    return function (target : Object, key : string) {
        const previousKeys = Reflect.getMetadata(InjectRepositoryKey, target) || [];
        previousKeys.push({prop : key, entity});
        Reflect.defineMetadata(InjectRepositoryKey, previousKeys, target);
    }
}
