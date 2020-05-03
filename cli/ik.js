"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("yaml");
const fs = require("fs");
const path = require("path");
const os = require("os");
const code_1 = require("./code");
function walk(p, cb) {
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
            walk(path.join(p, item), cb);
        }
    }
    else {
        return cb(p);
    }
    return true;
}
function copy(src, dst) {
    mkdirs(path.dirname(dst));
    fs.copyFileSync(src, dst);
}
function put(p, v) {
    mkdirs(path.dirname(p));
    fs.writeFileSync(p, v);
}
function mkdirs(p) {
    if (!p) {
        return;
    }
    if (fs.existsSync(p)) {
        return;
    }
    mkdirs(path.dirname(p));
    fs.mkdirSync(p);
}
var rawKeys = {
    "info": true
};
function parseArg(arg, vs) {
    switch (typeof arg) {
        case 'string':
            let v = arg.trim();
            let code = new code_1.Code(v);
            if (code.isString()) {
                vs.push(JSON.stringify(v));
            }
            else {
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
                    parseArg(arg[i], vs);
                }
                vs.push("]");
            }
            else {
                vs.push("{");
                let i = 0;
                for (let key in arg) {
                    if (i != 0) {
                        vs.push(",");
                    }
                    vs.push(JSON.stringify(key));
                    vs.push(":");
                    parseArg(arg[key], vs);
                    i++;
                }
                vs.push("}");
            }
            break;
        default:
            vs.push(JSON.stringify(arg));
            break;
    }
}
exports.parseArg = parseArg;
function parseThenItem(item, vs, prefix) {
    if (typeof item == 'object') {
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
                        parseArg(item.args[i], vs);
                    }
                }
                else {
                    parseArg(item.args, vs);
                }
            }
            vs.push(")");
            vs.push("\n");
            if (item.then) {
                vs.push(prefix + "  ");
                parseThen(item.then, vs, prefix + "  ");
            }
            return;
        }
        else if (item.ref) {
            vs.push("ik.logic(function(ctx){ return ik.exec(exports," + JSON.stringify(item.ref) + ",ctx); },ik.Context)\n");
            if (item.then) {
                vs.push(prefix + "  ");
                parseThen(item.then, vs, prefix + "  ");
            }
            return;
        }
    }
    vs.push('undefined\n');
}
exports.parseThenItem = parseThenItem;
function parseThen(then, vs, prefix) {
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
                parseThenItem(th, vs, prefix + "  ");
            }
            if (n > 0) {
                vs.push(prefix);
            }
            vs.push(")\n");
        }
        else if (then.name || then.ref) {
            vs.push(".then(\n");
            vs.push(prefix + "  ");
            parseThenItem(then, vs, prefix + "  ");
            vs.push(prefix);
            vs.push(")\n");
        }
    }
}
exports.parseThen = parseThen;
function parseLogic(key, object, vs) {
    if (object.title) {
        vs.push("/**\n * ");
        vs.push(object.title);
        vs.push("\n */\n");
    }
    vs.push("exports.");
    vs.push(key);
    vs.push(" = ik.app()\n");
    if (object.then) {
        vs.push("\t\t");
        parseThen(object.then, vs, "\t\t");
    }
}
exports.parseLogic = parseLogic;
function parse(object, basedir) {
    if (basedir) {
        basedir += '/';
    }
    else {
        basedir = './';
    }
    let vs = ['var ik = require("' + basedir + 'ik.min.js");\n\n'];
    vs.push('exports.exec = function(name,input) {\n');
    vs.push("\t return ik.exec(exports,name,input);\n");
    vs.push("}\n\n");
    if (typeof object == 'object') {
        for (let key in object) {
            let v = object[key];
            if (typeof v == 'object' && !rawKeys[key]) {
                parseLogic(key, v, vs);
            }
            else {
                vs.push("exports.");
                vs.push(key);
                vs.push(" = ");
                vs.push(JSON.stringify(v, undefined, 2));
                vs.push(";\n\n");
            }
        }
    }
    return vs.join('');
}
exports.parse = parse;
function ik(inDir, outDir) {
    walk(inDir, (p) => {
        let bname = path.relative(inDir, p);
        let basedir = [];
        for (let p of path.dirname(bname).split(os.FileSeparator)) {
            if (p && p != ".") {
                basedir.push('..');
            }
        }
        if (/\.js$/i.test(p)) {
            console.info(bname, ">>", path.join(outDir, bname));
            copy(p, path.join(outDir, bname));
        }
        else if (/\.json$/i.test(p)) {
            let toname = bname.substr(0, bname.length - path.extname(bname).length) + '.js';
            console.info(bname, ">>", path.join(outDir, toname));
            let v = fs.readFileSync(p).toJSON();
            put(path.join(outDir, toname), parse(v, basedir.join('/')));
        }
        else if (/\.yaml$/i.test(p) || /\.yml$/i.test(p)) {
            let toname = bname.substr(0, bname.length - path.extname(bname).length) + '.js';
            console.info(bname, ">>", path.join(outDir, toname));
            let v = fs.readFileSync(p).toString();
            let a = yaml.parseDocument(v).toJSON();
            console.info(JSON.stringify(a, undefined, 2));
            put(path.join(outDir, toname), parse(a, basedir.join('/')));
        }
        return true;
    });
}
exports.ik = ik;
