import { Logic, Options } from "../core/Logic";

export class Event extends Logic {

    constructor(name: any, ...args: any[]) {
        super((name: any, ...args: any[]) => {
            let pages = getCurrentPages();
            for (let page of pages) {
                let fn = (page as any)[name + ''];
                if (typeof fn == 'function') {
                    fn.apply(page, args)
                }
            }
        }, name, ...args);
    }

}

export function event(name: any, ...args: any[]): Logic {
    return new Event(name, ...args);
}
