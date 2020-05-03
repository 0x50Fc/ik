import { Logic, App as AppLogic, Set as SetLogic, Output, App } from "./Logic";
import { Context } from "../core/Context";

export function app(): Logic {
    return new AppLogic();
}

export function set(object: any): Logic {
    return new SetLogic(object);
}

export function logic(exec: (...args: any[]) => any, ...args: any[]): Logic {
    return new Logic(exec, ...args);
}

export function exec(object: any, name: string, input: any | Context): Promise<any> {
    let v = object[name];
    if (v instanceof Logic) {
        return v.exec(input);
    }
    return Promise.reject('未找到 ' + name);
}
