import { Context } from "./Context";

export class Logic {

    protected _onfulfilled?: Logic
    protected _onrejected?: Logic
    protected _exec: (...args: any[]) => any
    protected _args: any[]

    constructor(exec: (...args: any[]) => any, ...args: any[]) {
        this._exec = exec;
        this._args = args;
    }

    then(onfulfilled?: Logic, onrejected?: Logic): Logic {
        this._onfulfilled = onfulfilled;
        this._onrejected = onrejected;
        return this;
    }

    exec(ctx: Context = new Context()): Promise<any> {
        if (this._onfulfilled || this._onrejected) {
            return new Promise((resolve: (v: any) => void, reject: (reason: any) => void) => {
                let vs: any[] = ctx.evaluate(this._args);
                try {
                    let r = this._exec(...vs);
                    if (r instanceof Promise) {
                        r.then((v: any) => {
                            if (this._onfulfilled) {
                                let c = ctx.pushContext();
                                c.set('retValue', v);
                                resolve(this._onfulfilled.exec(c));
                            } else {
                                resolve(v);
                            }
                        }, (reason: any) => {
                            if (this._onrejected) {
                                let c = ctx.pushContext();
                                c.set('reason', reason);
                                resolve(this._onrejected.exec(c));
                            } else {
                                reject(reason);
                            }
                        });
                    } else {
                        if (this._onfulfilled) {
                            let c = ctx.pushContext();
                            c.set('retValue', r);
                            resolve(this._onfulfilled.exec(c));
                        } else {
                            resolve(r);
                        }
                    }
                } catch (reason) {
                    if (this._onrejected) {
                        let c = ctx.pushContext();
                        c.set('reason', reason);
                        resolve(this._onrejected.exec(c));
                    } else {
                        reject(reason);
                    }
                }

            });
        }
        let vs: any[] = ctx.evaluate(this._args);
        try {
            let r = this._exec(...vs);
            if (r instanceof Promise) {
                return r;
            }
            return Promise.resolve(r);
        } catch (reason) {
            return Promise.reject(reason);
        }
    }
}

export interface Options {
    [key: string]: any
}

export class Set extends Logic {

    constructor(options: Options) {
        super((ctx: Context, options: Options) => {
            for (let key in options) {
                let keys = key.split('.');
                ctx.setWithKeys(keys, options[key]);
            }
        }, Context, options);
    }
}

export interface Output {
    [key: string]: any
}

export class App extends Logic {

    constructor() {
        super(() => { });
    }

    exec(input: any | Context): Promise<Output> {
        if (input instanceof Context) {
            return super.exec(input);
        }
        let ctx = new Context();
        ctx.set('input', input);
        ctx.set('output', {});
        ctx.set('var', {});
        return new Promise<Output>((resolve: (v: Output) => void, reject: (reason: any) => void) => {
            super.exec(ctx).then(() => {
                resolve(ctx.get('output'));
            }, reject);
        });
    }
}