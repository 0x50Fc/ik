import { Logic } from "../core/Logic";
import { Context } from "../core/Context";

export enum OpenType {
    navigateTo = "navigateTo",
    redirectTo = "redirectTo"
}


var _openURL: ((url: string) => string) | undefined


export class Open extends Logic {

    constructor(url: any, openType: OpenType = OpenType.navigateTo) {
        super((url: any, openType: OpenType) => {
            let u = _openURL ? _openURL(url + '') : url + '';
            if (openType == OpenType.redirectTo) {
                wx.redirectTo({
                    url: u
                })
            } else {
                wx.navigateTo({
                    url: u
                })
            }

        }, url, openType);
    }

}


export class Close extends Logic {

    constructor(delta: any = 1) {
        super((delta: any) => {
            wx.navigateBack({
                delta: delta
            })
        }, delta);
    }

}

export interface EnvInterface {
    [key: string]: any
    platform: string
    model: string
    screenWidth: number
    screenHeight: number
    statusBarHeight: number
}

var _env: EnvInterface | undefined

export class Env extends Logic {

    constructor() {
        super((ctx: Context): any => {
            if (_env === undefined) {
                return new Promise<any>((resolve: (data?: any) => void, reject: (reason: any) => void) => {
                    wx.getSystemInfo({
                        success: function (res: wx.GetSystemInfoSuccessCallbackResult) {
                            _env = res
                            ctx.setGlobal('env', _env);
                            resolve();
                        },
                        fail: function (res: any) {
                            reject(res.errMsg);
                        }
                    });
                });
            } else {
                ctx.setGlobal('env', _env);
            }
        }, Context);
    }

}

export function setOpenURL(fn: ((url: string) => string) | undefined): void {
    _openURL = fn;
}

export function open(url: any, openType: OpenType = OpenType.navigateTo): Logic {
    return new Open(url, openType);
}

export function close(delta: any = 1): Logic {
    return new Close(delta);
}

export function env(): Logic {
    return new Env();
}
