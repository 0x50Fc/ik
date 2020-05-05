import * as yaml from "yaml"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { Code } from "./code";

function walk(p: string, cb: (p: string) => boolean): boolean {

    let ts = fs.statSync(p);

    if (ts === undefined) {
        return false;
    }

    if (ts.isDirectory()) {

        let basename = path.basename(p);
        if (basename == "node_modules") {
            return false;
        }

        let items = fs.readdirSync(p);

        for (let item of items) {

            if (item.startsWith(".")) {
                continue;
            }

            walk(path.join(p, item), cb)
        }
    } else {
        return cb(p);
    }

    return true;
}

function copy(src: string, dst: string): void {
    mkdirs(path.dirname(dst));
    fs.copyFileSync(src, dst);
}

function put(p: string, v: string): void {
    mkdirs(path.dirname(p));
    fs.writeFileSync(p, v);
}

function mkdirs(p: string): void {

    if (!p) {
        return;
    }

    if (fs.existsSync(p)) {
        return;
    }

    mkdirs(path.dirname(p));

    fs.mkdirSync(p);
}

var rawKeys: any = {
    "info": true
};

export function parseArg(arg: any, vs: string[], basedir: string): void {
    switch (typeof arg) {
        case 'string':
            let v = arg.trim();
            let code = new Code(v);
            if (code.isString()) {
                vs.push(JSON.stringify(v));
            } else {
                vs.push('[function(');
                vs.push(code.keys.join(','));
                vs.push("){ return ");
                vs.push(code.toString());
                vs.push("; },[");
                for (var i = 0; i < code.keys.length; i++) {
                    if (i != 0) {
                        vs.push(",");
                    }
                    vs.push(JSON.stringify(code.keys[i]));
                }
                vs.push("]]");
            }
            break;
        case 'object':
            if (arg instanceof Array) {
                vs.push("[");
                let n = arg.length;
                for (let i = 0; i < n; i++) {
                    if (i != 0) {
                        vs.push(",");
                    }
                    parseArg(arg[i], vs, basedir);
                }
                vs.push("]")
            } else {
                vs.push("{");
                let i = 0;
                for (let key in arg) {
                    if (i != 0) {
                        vs.push(",");
                    }
                    vs.push(JSON.stringify(key));
                    vs.push(":");
                    parseArg(arg[key], vs, basedir);
                    i++
                }
                vs.push("}");
            }
            break;
        default:
            vs.push(JSON.stringify(arg));
            break
    }
}

export function parseThenItem(item: any, vs: string[], prefix: string, basedir: string): void {

    if (typeof item == 'object' && item != null) {
        if (item.name) {
            vs.push('ik.');
            vs.push(item.name);
            vs.push("(");
            if (typeof item.args == 'object') {
                if (item.args instanceof Array) {
                    let n = item.args.length;
                    for (let i = 0; i < n; i++) {
                        if (i != 0) {
                            vs.push(",");
                        }
                        parseArg(item.args[i], vs, basedir);
                    }
                } else {
                    parseArg(item.args, vs, basedir);
                }
            }
            vs.push(")");
            vs.push("\n");
            if (item.logic) {
                parseLogic(item.logic, vs, prefix + "  ", basedir);
            }
            if (item.then) {
                vs.push(prefix + "  ")
                parseThen(item.then, vs, prefix + "  ", basedir);
            }
            return;
        } else if (item.ref) {
            let i = item.ref.indexOf(":");
            if (i > 0) {
                let p = item.ref.substr(0, i);
                let n = item.ref.substr(i + 1);
                if (/^\//i.test(p)) {
                    p = basedir + '..' + p
                }
                vs.push("ik.logic(function(ctx){ return ik.exec(require(" + JSON.stringify(p) + ")," + JSON.stringify(n) + ",ctx); },ik.Context)\n");
            } else {
                vs.push("ik.logic(function(ctx){ return ik.exec(exports," + JSON.stringify(item.ref) + ",ctx); },ik.Context)\n");
            }
            if (item.logic) {
                parseLogic(item.logic, vs, prefix + "  ", basedir);
            }
            if (item.then) {
                vs.push(prefix + "  ")
                parseThen(item.then, vs, prefix + "  ", basedir);
            }
            return;
        } else if (item.func) {
            let i = item.func.indexOf(":");
            if (i > 0) {
                let p = item.func.substr(0, i);
                let n = item.func.substr(i + 1);
                if (/^\//i.test(p)) {
                    p = basedir + '..' + p
                }
                vs.push("ik.logic(require(" + JSON.stringify(p) + ")." + n);
            } else {
                vs.push("ik.logic(require(" + JSON.stringify(item.func) + ")");
            }
            if (typeof item.args == 'object') {
                if (item.args instanceof Array) {
                    let n = item.args.length;
                    for (let i = 0; i < n; i++) {
                        vs.push(",");
                        parseArg(item.args[i], vs, basedir);
                    }
                } else {
                    parseArg(item.args, vs, basedir);
                }
            }
            vs.push(")");
            vs.push("\n");
            if (item.logic) {
                parseLogic(item.logic, vs, prefix + "  ", basedir);
            }
            if (item.then) {
                vs.push(prefix + "  ")
                parseThen(item.then, vs, prefix + "  ", basedir);
            }
            return;
        }
    }
    vs.push('undefined\n');
}

export function parseThen(then: any, vs: string[], prefix: string, basedir: string): void {
    if (typeof then == 'object') {
        if (then instanceof Array) {
            vs.push(".then(\n");
            let n = then.length;
            for (let i = 0; i < n && i < 2; i++) {
                let th = then[i];
                vs.push(prefix + "  ");
                if (i != 0) {
                    vs.push(",");
                }
                parseThenItem(th, vs, prefix + "  ", basedir);
            }
            if (n > 0) {
                vs.push(prefix);
            }
            vs.push(")\n");
        } else if (then != null && (then.name || then.ref || then.func)) {
            vs.push(".then(\n");
            vs.push(prefix + "  ");
            parseThenItem(then, vs, prefix + "  ", basedir);
            vs.push(prefix);
            vs.push(")\n");
        }
    }
}

export function parseLogic(logic: any, vs: string[], prefix: string, basedir: string): void {
    if (typeof logic == 'object') {
        if (logic instanceof Array) {
            for (let th of logic) {
                vs.push(prefix);
                vs.push(".add(\n");
                vs.push(prefix + "  ");
                parseThenItem(th, vs, prefix + "  ", basedir);
                vs.push(prefix);
                vs.push(")\n");
            }
        } else if (logic != null && (logic.name || logic.ref || logic.func)) {
            vs.push(prefix);
            vs.push(".add(\n");
            vs.push(prefix + "  ");
            parseThenItem(logic, vs, prefix + "  ", basedir);
            vs.push(prefix);
            vs.push(")\n");
        }
    }
}

export function parseApp(key: string, object: any, vs: string[], basedir: string): void {
    if (object.title) {
        vs.push("/**\n * ");
        vs.push(object.title);
        vs.push("\n */\n");
    }
    vs.push("exports.")
    vs.push(key)
    vs.push(" = ik.app()\n")
    if (object.logic) {
        parseLogic(object.logic, vs, "\t\t", basedir);
    }
    if (object.then) {
        vs.push("\t\t");
        parseThen(object.then, vs, "\t\t", basedir);
    }
}

export function parse(object: any, basedir: string): string {
    if (basedir) {
        basedir += '/';
    } else {
        basedir = './';
    }

    let vs: string[] = ['var ik = require("' + basedir + 'ik.min.js");\n\n'];

    vs.push('exports.exec = function(name,input) {\n');
    vs.push("\t return ik.exec(exports,name,input);\n")
    vs.push("}\n\n");

    if (typeof object == 'object') {
        for (let key in object) {
            let v = object[key];
            if (typeof v == 'object' && !rawKeys[key]) {
                parseApp(key, v, vs, basedir);
            } else {
                vs.push("exports.");
                vs.push(key);
                vs.push(" = ");
                vs.push(JSON.stringify(v, undefined, 2));
                vs.push(";\n\n")
            }
        }
    }

    return vs.join('');
}

export function ik(inDir: string, outDir: string): void {

    walk(inDir, (p: string): boolean => {

        let bname = path.relative(inDir, p);
        let basedir: string[] = [];

        for (let p of path.dirname(bname).split((os as any).FileSeparator)) {
            if (p && p != ".") {
                basedir.push('..')
            }
        }

        if (/\.js$/i.test(p)) {
            console.info(bname, ">>", path.join(outDir, bname))
            copy(p, path.join(outDir, bname))
        } else if (/\.json$/i.test(p)) {
            let toname = bname.substr(0, bname.length - path.extname(bname).length) + '.js';
            console.info(bname, ">>", path.join(outDir, toname));
            let v = fs.readFileSync(p).toJSON()
            put(path.join(outDir, toname), parse(v, basedir.join('/')));
        } else if (/\.yaml$/i.test(p) || /\.yml$/i.test(p)) {
            let toname = bname.substr(0, bname.length - path.extname(bname).length) + '.js';
            console.info(bname, ">>", path.join(outDir, toname));
            let v = fs.readFileSync(p).toString();
            let a = yaml.parseDocument(v).toJSON();
            console.info(JSON.stringify(a, undefined, 2));
            put(path.join(outDir, toname), parse(a, basedir.join('/')));
        }

        return true;
    })

}