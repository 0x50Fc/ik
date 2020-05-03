"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("@babel/parser");
class Code {
    constructor(source) {
        this.tokens = [];
        this.keys = [];
        this.code = this.compile(source);
    }
    compileExpression(node, keys, keySet, ofnode) {
        var vs = [];
        switch (node.type) {
            case 'ObjectExpression':
                vs.push('{');
                var dot = '';
                for (let p of node.properties) {
                    vs.push(dot);
                    vs.push(this.compileExpression(p, keys, keySet));
                    dot = ',';
                }
                vs.push('}');
                break;
            case 'SpreadElement':
                vs.push("...");
                vs.push(this.compileExpression(node.argument, keys, keySet));
                break;
            case 'ObjectProperty':
                {
                    let key = node.key;
                    let value = node.value;
                    if (key.type == 'Identifier') {
                        vs.push(key.name);
                    }
                    else {
                        vs.push(this.compileExpression(key, keys, keySet));
                    }
                    vs.push(':');
                    vs.push(this.compileExpression(value, keys, keySet));
                }
                break;
            case 'StringLiteral':
                vs.push(JSON.stringify(node.value));
                break;
            case 'NumericLiteral':
                vs.push(JSON.stringify(node.value));
                break;
            case 'BooleanLiteral':
                vs.push(JSON.stringify(node.value));
                break;
            case 'Identifier':
                {
                    let name = node.name;
                    if (ofnode === undefined && !keySet[name]) {
                        keySet[name] = true;
                        keys.push(name);
                    }
                    vs.push(name);
                }
                break;
            case 'ConditionalExpression':
                vs.push('(');
                vs.push(this.compileExpression(node.test, keys, keySet));
                vs.push('?');
                vs.push(this.compileExpression(node.consequent, keys, keySet));
                vs.push(':');
                vs.push(this.compileExpression(node.alternate, keys, keySet));
                vs.push(')');
                break;
            case 'UnaryExpression':
                vs.push('(');
                if (node.prefix) {
                    vs.push(node.operator);
                    vs.push(this.compileExpression(node.argument, keys, keySet));
                }
                else {
                    vs.push(this.compileExpression(node.argument, keys, keySet));
                    vs.push(node.operator);
                }
                vs.push(')');
                break;
            case 'MemberExpression':
                if (ofnode === undefined) {
                    var key;
                    var p = node.object;
                    while (p) {
                        if (p.type == 'MemberExpression') {
                            p = p.object;
                        }
                        else if (p.type == 'Identifier') {
                            key = p.name;
                            break;
                        }
                        else if (p.type == 'CallExpression') {
                            p = p.callee;
                        }
                        else {
                            console.info("[MemberExpression]", JSON.stringify(node, undefined, 2));
                            process.abort();
                            break;
                        }
                    }
                    if (key !== undefined && !keySet[key]) {
                        keySet[key] = true;
                        keys.push(key);
                    }
                }
                vs.push(this.compileExpression(node.object, keys, keySet, ofnode || node));
                if (node.computed) {
                    vs.push('[');
                    vs.push(this.compileExpression(node.property, keys, keySet));
                    vs.push(']');
                }
                else {
                    vs.push('.');
                    vs.push(this.compileExpression(node.property, keys, keySet, ofnode || node));
                }
                break;
            case 'BinaryExpression':
            case 'LogicalExpression':
                vs.push('(');
                vs.push(this.compileExpression(node.left, keys, keySet));
                vs.push(node.operator);
                vs.push(this.compileExpression(node.right, keys, keySet));
                vs.push(')');
                break;
            case 'CallExpression':
                vs.push(this.compileExpression(node.callee, keys, keySet, ofnode));
                vs.push('(');
                var dot = '';
                for (let p of node.arguments) {
                    vs.push(dot);
                    vs.push(this.compileExpression(p, keys, keySet));
                    dot = ',';
                }
                vs.push(')');
                break;
            case 'ArrayExpression':
                vs.push('[');
                var dot = '';
                for (let p of node.elements) {
                    if (p !== null) {
                        vs.push(dot);
                        vs.push(this.compileExpression(p, keys, keySet));
                        dot = ',';
                    }
                }
                vs.push(']');
                break;
            default:
                console.error(node.type, JSON.stringify(node, undefined, 2));
                process.abort();
                break;
        }
        return vs.join('');
    }
    compile(source) {
        let idx = 0;
        let code = [];
        let keys = this.keys;
        let keySet = {};
        source.replace(/{{([^\{\}]*?)}}/g, (text, v, index) => {
            // console.info("[CODE]", v);
            var e;
            try {
                e = parser_1.parseExpression(v);
            }
            catch (ex) {
                try {
                    e = parser_1.parseExpression('{' + v + '}');
                }
                catch (ex) {
                    console.info(v);
                    throw ex;
                }
            }
            if (idx < index) {
                let s = JSON.stringify(source.substr(idx, index - idx));
                this.tokens.push(s);
                code.push(s);
            }
            idx = index + text.length;
            this.tokens.push(e);
            v = this.compileExpression(e, keys, keySet);
            // console.info("[E]", v);
            code.push('(' + v + ')');
            return '';
        });
        if (code.length == 0) {
            let s = JSON.stringify(source);
            this.tokens.push(s);
            return s;
        }
        if (idx < source.length) {
            let s = JSON.stringify(source.substr(idx));
            this.tokens.push(s);
            code.push(s);
        }
        return code.join('+');
    }
    isString() {
        for (let t of this.tokens) {
            if (typeof t != 'string') {
                return false;
            }
        }
        return true;
    }
    toString() {
        return this.code;
    }
}
exports.Code = Code;
