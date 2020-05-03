"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Context = (function () {
    function Context(object, parent) {
        if (object === void 0) { object = {}; }
        this._object = object;
        this._parent = parent;
    }
    Context.prototype.pushContext = function (object) {
        if (object === void 0) { object = {}; }
        return new Context(object, this);
    };
    Context.prototype.popContext = function () {
        return this._parent;
    };
    Context.prototype.evaluate = function (object) {
        if (object == Context) {
            return this;
        }
        if (typeof object == 'object') {
            if (object instanceof Array) {
                if (object.length == 2 && typeof object[0] == 'function' && object[1] instanceof Array) {
                    var keys = object[1];
                    var vs_1 = [];
                    var fn = object[0];
                    for (var i = 0; i < keys.length; i++) {
                        var v = this.get(keys[i]);
                        vs_1.push(v);
                    }
                    return fn.apply(this, vs_1);
                }
                var vs = [];
                for (var _i = 0, object_1 = object; _i < object_1.length; _i++) {
                    var item = object_1[_i];
                    var v = this.evaluate(item);
                    vs.push(v);
                }
                return vs;
            }
            else {
                var a = {};
                for (var key in object) {
                    a[key] = this.evaluate(object[key]);
                }
                return a;
            }
        }
        return object;
    };
    Context.prototype.get = function (key) {
        var v = this._object[key];
        if (v === undefined) {
            if (this._parent) {
                v = this._parent.get(key);
            }
        }
        return v;
    };
    Context.prototype.set = function (key, value) {
        if (value === undefined) {
            delete this._object[key];
        }
        else {
            this._object[key] = value;
        }
    };
    Context.prototype.setGlobal = function (key, value) {
        if (this._parent) {
            this._parent.setGlobal(key, value);
        }
        else if (value === undefined) {
            delete this._object[key];
        }
        else {
            this._object[key] = value;
        }
    };
    Context.prototype.setWithKeys = function (keys, value) {
        if (keys.length == 0) {
            return;
        }
        if (value === undefined) {
            if (keys.length == 1) {
                var key_1 = keys[0];
                delete this._object[key_1];
                return;
            }
            var index = 0;
            var key = keys[index++];
            var object = this.get(key);
            while (index < keys.length - 1 && typeof object == 'object') {
                key = keys[index];
                object = object[key];
                index++;
            }
            if (index < keys.length && typeof object == 'object') {
                key = keys[index];
                delete object[key];
            }
        }
        else {
            if (keys.length == 1) {
                var key_2 = keys[0];
                this._object[key_2] = value;
                return;
            }
            var index = 0;
            var key = keys[index++];
            var object = this.get(key);
            if (typeof object != 'object') {
                object = this._object[key] = {};
            }
            while (index < keys.length - 1) {
                key = keys[index];
                var v = object[key];
                if (typeof v != 'object') {
                    v = object[key] = {};
                }
                object = v;
                index++;
            }
            if (index < keys.length && typeof object == 'object') {
                key = keys[index];
                object[key] = value;
            }
        }
    };
    return Context;
}());
exports.Context = Context;
