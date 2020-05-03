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
var OpenType;
(function (OpenType) {
    OpenType["navigateTo"] = "navigateTo";
    OpenType["redirectTo"] = "redirectTo";
})(OpenType = exports.OpenType || (exports.OpenType = {}));
var _openURL;
var Open = (function (_super) {
    __extends(Open, _super);
    function Open(url, openType) {
        if (openType === void 0) { openType = OpenType.navigateTo; }
        return _super.call(this, function (url, openType) {
            var u = _openURL ? _openURL(url + '') : url + '';
            if (openType == OpenType.redirectTo) {
                wx.redirectTo({
                    url: u
                });
            }
            else {
                wx.navigateTo({
                    url: u
                });
            }
        }, url, openType) || this;
    }
    return Open;
}(Logic_1.Logic));
exports.Open = Open;
var Close = (function (_super) {
    __extends(Close, _super);
    function Close(delta) {
        if (delta === void 0) { delta = 1; }
        return _super.call(this, function (delta) {
            wx.navigateBack({
                delta: delta
            });
        }, delta) || this;
    }
    return Close;
}(Logic_1.Logic));
exports.Close = Close;
var _env;
var Env = (function (_super) {
    __extends(Env, _super);
    function Env() {
        return _super.call(this, function (ctx) {
            if (_env === undefined) {
                return new Promise(function (resolve, reject) {
                    wx.getSystemInfo({
                        success: function (res) {
                            _env = res;
                            ctx.setGlobal('env', _env);
                            resolve();
                        },
                        fail: function (res) {
                            reject(res.errMsg);
                        }
                    });
                });
            }
            else {
                ctx.setGlobal('env', _env);
            }
        }, Context_1.Context) || this;
    }
    return Env;
}(Logic_1.Logic));
exports.Env = Env;
function setOpenURL(fn) {
    _openURL = fn;
}
exports.setOpenURL = setOpenURL;
function open(url, openType) {
    if (openType === void 0) { openType = OpenType.navigateTo; }
    return new Open(url, openType);
}
exports.open = open;
function close(delta) {
    if (delta === void 0) { delta = 1; }
    return new Close(delta);
}
exports.close = close;
function env() {
    return new Env();
}
exports.env = env;
