import { Logic } from "../core/Logic";
import { Context } from "../core/Context";

export class Login extends Logic {

    constructor() {
        super((ctx: Context): any => {
            return new Promise<any>((resolve: (data?: any) => void, reject: (reason: any) => void) => {
                wx.login({
                    success: function (res: wx.LoginSuccessCallbackResult) {
                        let c = ctx.pushContext();
                        c.set("retValue",res.code);
                        resolve(res.code);
                    },
                    fail: function (res: any) {
                        reject(res.errMsg);
                    }
                });
            });
        }, Context);
    }

}

export class GetUserInfo extends Logic {

    constructor() {
        super((ctx: Context): any => {
            return new Promise<any>((resolve: (data?: any) => void, reject: (reason: any) => void) => {
                wx.getUserInfo({
                    success: function (res: wx.GetUserInfoSuccessCallbackResult) {
                        let c = ctx.pushContext();
                        c.set("retValue",res);
                        resolve(res);
                    },
                    fail: function (res: any) {
                        reject(res.errMsg);
                    }
                })
            });
        }, Context);
    }

}

export function login(): Logic {
    return new Login();
}

export function getUserInfo(): Logic {
    return new GetUserInfo();
}
