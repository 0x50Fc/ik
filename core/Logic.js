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
var Context_1 = require("./Context");
var Logic = (function () {
    function Logic(exec) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this._exec = exec;
        this._args = args;
    }
    Logic.prototype.then = function (onfulfilled, onrejected) {
        this._onfulfilled = onfulfilled;
        this._onrejected = onrejected;
        return this;
    };
    Logic.prototype.add = function (logic) {
        return this;
    };
    Logic.prototype.call = function (ctx) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (typeof this._exec == 'function') {
            return this._exec.apply(this, args);
        }
    };
    Logic.prototype.exec = function (ctx) {
        var _this = this;
        if (ctx === void 0) { ctx = new Context_1.Context(); }
        if (this._onfulfilled || this._onrejected) {
            return new Promise(function (resolve, reject) {
                var vs = ctx.evaluate(_this._args);
                try {
                    var r = _this.call.apply(_this, [ctx].concat(vs));
                    if (r instanceof Promise) {
                        r.then(function (v) {
                            if (_this._onfulfilled) {
                                var c = ctx.pushContext();
                                c.set('retValue', v);
                                resolve(_this._onfulfilled.exec(c));
                            }
                            else {
                                resolve(v);
                            }
                        }, function (reason) {
                            if (_this._onrejected) {
                                var c = ctx.pushContext();
                                c.set('reason', reason);
                                resolve(_this._onrejected.exec(c));
                            }
                            else {
                                reject(reason);
                            }
                        });
                    }
                    else {
                        if (_this._onfulfilled) {
                            var c = ctx.pushContext();
                            c.set('retValue', r);
                            resolve(_this._onfulfilled.exec(c));
                        }
                        else {
                            resolve(r);
                        }
                    }
                }
                catch (reason) {
                    if (_this._onrejected) {
                        var c = ctx.pushContext();
                        c.set('reason', reason);
                        resolve(_this._onrejected.exec(c));
                    }
                    else {
                        reject(reason);
                    }
                }
            });
        }
        var vs = ctx.evaluate(this._args);
        try {
            var r = this.call.apply(this, [ctx].concat(vs));
            if (r instanceof Promise) {
                return r;
            }
            return Promise.resolve(r);
        }
        catch (reason) {
            return Promise.reject(reason);
        }
    };
    return Logic;
}());
exports.Logic = Logic;
var Mixed = (function (_super) {
    __extends(Mixed, _super);
    function Mixed() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._logics = [];
        return _this;
    }
    Mixed.prototype.add = function (logic) {
        this._logics.push(logic);
        return this;
    };
    Mixed.prototype.call = function (ctx) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var vs = [];
        for (var _a = 0, _b = this._logics; _a < _b.length; _a++) {
            var v = _b[_a];
            vs.push(v.exec(ctx));
        }
        if (vs.length == 0) {
            return _super.prototype.call.apply(this, [ctx].concat(args));
        }
        var r = _super.prototype.call.apply(this, [ctx].concat(args));
        if (r instanceof Promise) {
            vs.push(r);
        }
        else {
            vs.push(Promise.resolve(r));
        }
        return new Promise(function (resolve, reject) {
            var n = vs.length;
            var i = 0;
            var errCount = 0;
            var reason;
            var done = function (r, e) {
                if (e) {
                    errCount++;
                    if (!reason) {
                        reason = e;
                    }
                }
                if (++i == n) {
                    if (errCount > 0) {
                        reject(reason);
                    }
                    else {
                        resolve();
                    }
                }
            };
            for (var _i = 0, vs_1 = vs; _i < vs_1.length; _i++) {
                var v = vs_1[_i];
                v.then(done, done);
            }
        });
    };
    return Mixed;
}(Logic));
exports.Mixed = Mixed;
var All = (function (_super) {
    __extends(All, _super);
    function All() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._logics = [];
        return _this;
    }
    All.prototype.add = function (logic) {
        this._logics.push(logic);
        return this;
    };
    All.prototype.call = function (ctx) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var vs = [];
        for (var _a = 0, _b = this._logics; _a < _b.length; _a++) {
            var v = _b[_a];
            vs.push(v.exec(ctx));
        }
        if (vs.length == 0) {
            return _super.prototype.call.apply(this, [ctx].concat(args));
        }
        var r = _super.prototype.call.apply(this, [ctx].concat(args));
        if (r instanceof Promise) {
            vs.push(r);
        }
        else {
            vs.push(Promise.resolve(r));
        }
        return Promise.all(vs);
    };
    return All;
}(Logic));
exports.All = All;
var Race = (function (_super) {
    __extends(Race, _super);
    function Race() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._logics = [];
        return _this;
    }
    Race.prototype.add = function (logic) {
        this._logics.push(logic);
        return this;
    };
    Race.prototype.call = function (ctx) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var vs = [];
        for (var _a = 0, _b = this._logics; _a < _b.length; _a++) {
            var v = _b[_a];
            vs.push(v.exec(ctx));
        }
        if (vs.length == 0) {
            return _super.prototype.call.apply(this, [ctx].concat(args));
        }
        var r = _super.prototype.call.apply(this, [ctx].concat(args));
        if (r instanceof Promise) {
            vs.push(r);
        }
        else {
            vs.push(Promise.resolve(r));
        }
        return Promise.all(vs);
    };
    return Race;
}(Logic));
exports.Race = Race;
var Set = (function (_super) {
    __extends(Set, _super);
    function Set(options) {
        return _super.call(this, function (ctx, options) {
            for (var key in options) {
                var keys = key.split('.');
                ctx.setWithKeys(keys, options[key]);
            }
        }, Context_1.Context, options) || this;
    }
    return Set;
}(Logic));
exports.Set = Set;
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        return _super.call(this, function () { }) || this;
    }
    App.prototype.exec = function (input) {
        var _this = this;
        if (input instanceof Context_1.Context) {
            return _super.prototype.exec.call(this, input);
        }
        var ctx = new Context_1.Context();
        ctx.set('input', input);
        ctx.set('output', {});
        ctx.set('self', {});
        return new Promise(function (resolve, reject) {
            _super.prototype.exec.call(_this, ctx).then(function () {
                resolve(ctx.get('output'));
            }, reject);
        });
    };
    return App;
}(Mixed));
exports.App = App;
