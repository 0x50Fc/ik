"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Logic_1 = require("../core/Logic");
var Context_1 = require("../core/Context");
var Login = (function (_super) {
    __extends(Login, _super);
    function Login() {
        return _super.call(this, function (ctx) {
            return new Promise(function (resolve, reject) {
                wx.login({
                    success: function (res) {
                        var c = ctx.pushContext();
                        c.set("retValue", res.code);
                        resolve(res.code);
                    },
                    fail: function (res) {
                        reject(res.errMsg);
                    }
                });
            });
        }, Context_1.Context) || this;
    }
    return Login;
}(Logic_1.Logic));
exports.Login = Login;
var GetUserInfo = (function (_super) {
    __extends(GetUserInfo, _super);
    function GetUserInfo() {
        return _super.call(this, function (ctx) {
            return new Promise(function (resolve, reject) {
                wx.getUserInfo({
                    success: function (res) {
                        var c = ctx.pushContext();
                        c.set("retValue", res);
                        resolve(res);
                    },
                    fail: function (res) {
                        reject(res.errMsg);
                    }
                });
            });
        }, Context_1.Context) || this;
    }
    return GetUserInfo;
}(Logic_1.Logic));
exports.GetUserInfo = GetUserInfo;
function login() {
    return new Login();
}
exports.login = login;
function getUserInfo() {
    return new GetUserInfo();
}
exports.getUserInfo = getUserInfo;
