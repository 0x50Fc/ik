import { Logic, App as AppLogic, Set as SetLogic, Output, App, Race, Mixed, All } from "./Logic";
import { Context } from "../core/Context";

export function app(): Logic {
    return new AppLogic();
}

export function set(object: any): Logic {
    return new SetLogic(object);
}

export function race(object: any): Logic {
    return new Race(object);
}

export function mixed(object: any): Logic {
    return new Mixed(object);
}

export function all(object: any): Logic {
    return new All(object);
}

export function logic(exec: (...args: any[]) => any, ...args: any[]): Logic {
    return new Logic(exec, ...args);
}

export function If(v: any): Logic {
    return new Logic((v: any): any => {
        if (v) {
            return Promise.resolve(v);
        }
        return Promise.reject('If');
    }, v);
}

export function Throw(errmsg: any): Logic {
    return new Logic((errmsg: any): any => {
        return Promise.reject(errmsg);
    }, errmsg);
}

export function exec(object: any, name: string, input: any | Context): Promise<any> {
    let v = object[name];
    if (v instanceof Promise) {
        return v;
    }
    if (v instanceof Logic) {
        return v.exec(input);
    }
    return Promise.reject('未找到 ' + name);
}
