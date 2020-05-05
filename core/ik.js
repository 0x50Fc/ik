"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logic_1 = require("./Logic");
function app() {
    return new Logic_1.App();
}
exports.app = app;
function set(object) {
    return new Logic_1.Set(object);
}
exports.set = set;
function race(object) {
    return new Logic_1.Race(object);
}
exports.race = race;
function mixed(object) {
    return new Logic_1.Mixed(object);
}
exports.mixed = mixed;
function all(object) {
    return new Logic_1.All(object);
}
exports.all = all;
function logic(exec) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new (Logic_1.Logic.bind.apply(Logic_1.Logic, [void 0, exec].concat(args)))();
}
exports.logic = logic;
function If(v) {
    return new Logic_1.Logic(function (v) {
        if (v) {
            return Promise.resolve(v);
        }
        return Promise.reject('If');
    }, v);
}
exports.If = If;
function Throw(errmsg) {
    return new Logic_1.Logic(function (errmsg) {
        return Promise.reject(errmsg);
    }, errmsg);
}
exports.Throw = Throw;
function exec(object, name, input) {
    var v = object[name];
    if (v instanceof Promise) {
        return v;
    }
    if (v instanceof Logic_1.Logic) {
        return v.exec(input);
    }
    return Promise.reject('未找到 ' + name);
}
exports.exec = exec;
