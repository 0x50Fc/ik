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
var Http = (function (_super) {
    __extends(Http, _super);
    function Http(options) {
        return _super.call(this, function (ctx, options) {
            return new Promise(function (resolve, reject) {
                wx.request({
                    method: options.method || "GET",
                    url: options.url,
                    data: options.data,
                    header: options.header,
                    success: function (res) {
                        var v = ctx.pushContext();
                        v.set('retValue', res.data);
                        resolve(v);
                    },
                    fail: function (e) {
                        reject(e.errMsg || '请检查网络设置');
                    }
                });
            });
        }, Context_1.Context, options) || this;
    }
    return Http;
}(Logic_1.Logic));
exports.Http = Http;
function http(options) {
    return new Http(options);
}
exports.http = http;
