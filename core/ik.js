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
function logic(exec) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new (Logic_1.Logic.bind.apply(Logic_1.Logic, [void 0, exec].concat(args)))();
}
exports.logic = logic;
function exec(object, name, input) {
    var v = object[name];
    if (v instanceof Logic_1.Logic) {
        return v.exec(input);
    }
    return Promise.reject('未找到 ' + name);
}
exports.exec = exec;
