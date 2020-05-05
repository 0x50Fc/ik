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
var GetStore = (function (_super) {
    __extends(GetStore, _super);
    function GetStore(options) {
        return _super.call(this, function (ctx, options) {
            return new Promise(function (resolve) {
                var vs = [];
                for (var key in options) {
                    var keys = key.split('.');
                    var sKey = options[key];
                    (function (keys, sKey) {
                        vs.push(new Promise(function (resolve) {
                            wx.getStorage({
                                key: sKey,
                                success: function (res) {
                                    ctx.setWithKeys(keys, res.data);
                                    resolve();
                                },
                                fail: function () {
                                    resolve();
                                }
                            });
                        }));
                    })(keys, sKey);
                }
                if (vs.length == 0) {
                    resolve();
                }
                else if (vs.length == 1) {
                    vs[0].then(function () {
                        resolve();
                    });
                }
                else {
                    Promise.all(vs).then(function () {
                        resolve();
                    });
                }
            });
        }, Context_1.Context, options) || this;
    }
    return GetStore;
}(Logic_1.Logic));
exports.GetStore = GetStore;
var SetStore = (function (_super) {
    __extends(SetStore, _super);
    function SetStore(options) {
        return _super.call(this, function (options) {
            return new Promise(function (resolve) {
                var vs = [];
                for (var key in options) {
                    var v = options[key];
                    (function (key, v) {
                        vs.push(new Promise(function (resolve) {
                            wx.setStorage({
                                key: key,
                                data: v,
                                complete: function () {
                                    resolve();
                                }
                            });
                        }));
                    })(key, v);
                }
                if (vs.length == 0) {
                    resolve();
                }
                else if (vs.length == 1) {
                    vs[0].then(function () {
                        resolve();
                    });
                }
                else {
                    Promise.all(vs).then(function () {
                        resolve();
                    });
                }
            });
        }, options) || this;
    }
    return SetStore;
}(Logic_1.Logic));
exports.SetStore = SetStore;
function getStore(options) {
    return new GetStore(options);
}
exports.getStore = getStore;
function setStore(options) {
    return new SetStore(options);
}
exports.setStore = setStore;
