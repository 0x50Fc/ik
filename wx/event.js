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
var Event = (function (_super) {
    __extends(Event, _super);
    function Event(name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return _super.apply(this, [function (name) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var pages = getCurrentPages();
                for (var _a = 0, pages_1 = pages; _a < pages_1.length; _a++) {
                    var page = pages_1[_a];
                    var fn = page[name + ''];
                    if (typeof fn == 'function') {
                        fn.apply(page, args);
                    }
                }
            }, name].concat(args)) || this;
    }
    return Event;
}(Logic_1.Logic));
exports.Event = Event;
function event(name) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new (Event.bind.apply(Event, [void 0, name].concat(args)))();
}
exports.event = event;
