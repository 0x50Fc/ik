import { Logic } from "../core/Logic";
import { Context } from "../core/Context";

export class Http extends Logic {

    protected options: any;

    constructor(options: any) {
        super((ctx: Context, options: any): any => {
            return new Promise<any>((resolve: (data: any) => void, reject: (error: any) => void) => {
                wx.request({
                    method: options.method || "GET",
                    url: options.url,
                    data: options.data,
                    header: options.header,
                    success: function (res: any) {
                        let v = ctx.pushContext();
                        v.set('retValue', res.data);
                        resolve(v);
                    },
                    fail: function (e: any) {
                        reject(e.errMsg || '请检查网络设置');
                    }
                });
            });
        }, Context, options);
    }
    
}

export function http(options: any): Logic {
    return new Http(options);
}