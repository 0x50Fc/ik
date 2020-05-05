import { Logic, Options } from "../core/Logic";
import { Context } from "../core/Context";

export class GetStore extends Logic {

    constructor(options: Options) {
        super((ctx: Context, options: Options) => {
            return new Promise<any>((resolve: (data?: any) => void) => {
                let vs: Promise<any>[] = [];
                for (let key in options) {
                    let keys = key.split('.');
                    let sKey = options[key];
                    (function (keys: string[], sKey: string) {
                        vs.push(new Promise<any>((resolve: () => void) => {
                            wx.getStorage({
                                key: sKey,
                                success: function (res: any) {
                                    ctx.setWithKeys(keys, res.data);
                                    resolve();
                                },
                                fail: function () {
                                    resolve();
                                }
                            });
                        }))
                    })(keys, sKey);
                }
                if (vs.length == 0) {
                    resolve();
                } else if (vs.length == 1) {
                    vs[0].then(() => {
                        resolve();
                    });
                } else {
                    Promise.all(vs).then(() => {
                        resolve();
                    })
                }
            });
        }, Context, options);
    }

}

export class SetStore extends Logic {

    constructor(options: Options) {
        super((options: Options) => {
            return new Promise<any>((resolve: (data?: any) => void) => {
                let vs: Promise<any>[] = [];
                for (let key in options) {
                    let v = options[key];
                    (function (key: string, v: any) {
                        vs.push(new Promise<any>((resolve: () => void) => {
                            wx.setStorage({
                                key: key,
                                data: v,
                                complete: function () {
                                    resolve();
                                }
                            });
                        }))
                    })(key, v);
                }
                if (vs.length == 0) {
                    resolve();
                } else if (vs.length == 1) {
                    vs[0].then(() => {
                        resolve();
                    });
                } else {
                    Promise.all(vs).then(() => {
                        resolve();
                    })
                }
            });
        }, options);
    }

}

export function getStore(options: any): Logic {
    return new GetStore(options);
}


export function setStore(options: any): Logic {
    return new SetStore(options);
}
