
import { Expression, Node, ObjectExpression, SpreadElement, ObjectProperty, StringLiteral, NumericLiteral, BooleanLiteral, Identifier, ConditionalExpression, UnaryExpression, MemberExpression, BinaryExpression, CallExpression, ArrayExpression } from "@babel/types"
import { parseExpression } from "@babel/parser"

export type CodeToken = string | Expression

interface KeySet {
    [key: string]: boolean
}

export class Code {

    readonly tokens: CodeToken[]
    readonly keys: string[]
    readonly code: string

    constructor(source: string) {
        this.tokens = [];
        this.keys = [];
        this.code = this.compile(source);
    }

    protected compileExpression(node: Node, keys: string[], keySet: KeySet, ofnode?: Node): string {

        var vs = [];
        switch (node.type) {
            case 'ObjectExpression':
                vs.push('{');
                var dot = '';
                for (let p of (node as ObjectExpression).properties) {
                    vs.push(dot);
                    vs.push(this.compileExpression(p, keys, keySet));
                    dot = ',';
                }
                vs.push('}');
                break;
            case 'SpreadElement':
                vs.push("...");
                vs.push(this.compileExpression((node as SpreadElement).argument, keys, keySet));
                break;
            case 'ObjectProperty':
                {
                    let key = (node as ObjectProperty).key;
                    let value = (node as ObjectProperty).value;
                    if (key.type == 'Identifier') {
                        vs.push(key.name);
                    } else {
                        vs.push(this.compileExpression(key, keys, keySet))
                    }
                    vs.push(':');
                    vs.push(this.compileExpression(value, keys, keySet))
                }
                break;
            case 'StringLiteral':
                vs.push(JSON.stringify((node as StringLiteral).value));
                break;
            case 'NumericLiteral':
                vs.push(JSON.stringify((node as NumericLiteral).value));
                break;
            case 'BooleanLiteral':
                vs.push(JSON.stringify((node as BooleanLiteral).value));
                break;
            case 'Identifier':
                {
                    let name = (node as Identifier).name;

                    if (ofnode === undefined && !keySet[name]) {
                        keySet[name] = true;
                        keys.push(name);
                    }

                    vs.push(name);
                }
                break;
            case 'ConditionalExpression':
                vs.push('(');
                vs.push(this.compileExpression((node as ConditionalExpression).test, keys, keySet));
                vs.push('?');
                vs.push(this.compileExpression((node as ConditionalExpression).consequent, keys, keySet));
                vs.push(':');
                vs.push(this.compileExpression((node as ConditionalExpression).alternate, keys, keySet));
                vs.push(')')
                break;
            case 'UnaryExpression':
                vs.push('(')
                if ((node as UnaryExpression).prefix) {
                    vs.push((node as UnaryExpression).operator);
                    vs.push(this.compileExpression((node as UnaryExpression).argument, keys, keySet));
                } else {
                    vs.push(this.compileExpression((node as UnaryExpression).argument, keys, keySet));
                    vs.push((node as UnaryExpression).operator);
                }
                vs.push(')')
                break;
            case 'MemberExpression':
                if (ofnode === undefined) {
                    var key: string | undefined;
                    var p: any = (node as MemberExpression).object;
                    while (p) {
                        if (p.type == 'MemberExpression') {
                            p = p.object;
                        } else if (p.type == 'Identifier') {
                            key = p.name;
                            break;
                        } else if (p.type == 'CallExpression') {
                            p = p.callee;
                        } else {
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

                vs.push(this.compileExpression((node as MemberExpression).object, keys, keySet, ofnode || node));

                if ((node as MemberExpression).computed) {
                    vs.push('[');
                    vs.push(this.compileExpression((node as MemberExpression).property, keys, keySet));
                    vs.push(']');
                } else {
                    vs.push('.');
                    vs.push(this.compileExpression((node as MemberExpression).property, keys, keySet, ofnode || node));
                }

                break;
            case 'BinaryExpression':
            case 'LogicalExpression':
                vs.push('(')
                vs.push(this.compileExpression((node as BinaryExpression).left, keys, keySet));
                vs.push((node as BinaryExpression).operator);
                vs.push(this.compileExpression((node as BinaryExpression).right, keys, keySet));
                vs.push(')')
                break;
            case 'CallExpression':
                vs.push(this.compileExpression((node as CallExpression).callee, keys, keySet, ofnode));
                vs.push('(');
                var dot = '';
                for (let p of (node as CallExpression).arguments) {
                    vs.push(dot);
                    vs.push(this.compileExpression(p, keys, keySet));
                    dot = ',';
                }
                vs.push(')');
                break;
            case 'ArrayExpression':
                vs.push('[');
                var dot = '';
                for (let p of (node as ArrayExpression).elements) {
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

    protected compile(source: string): string {

        let idx = 0;
        let code: string[] = [];
        let keys = this.keys;
        let keySet: KeySet = { 'undefined': true, 'null': true, 'true': true, 'false': true };

        source.replace(/{{([^\{\}]*?)}}/g, (text: string, v: string, index: number): string => {

            // console.info("[CODE]", v);

            var e: Expression;

            try {
                e = parseExpression(v);
            } catch (ex) {
                try {
                    e = parseExpression('{' + v + '}');
                } catch (ex) {
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

    isString(): boolean {
        for (let t of this.tokens) {
            if (typeof t != 'string') {
                return false;
            }
        }
        return true;
    }

    toString(): string {
        return this.code;
    }

}