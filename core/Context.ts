

export class Context {

    protected _parent?: Context
    protected _object: any

    constructor(object: any = {}, parent?: Context) {
        this._object = object;
        this._parent = parent;
    }

    pushContext(object: any = {}): Context {
        return new Context(object, this)
    }

    popContext(): Context | undefined {
        return this._parent;
    }

    evaluate(object: any): any {

        if (object == Context) {
            return this;
        }

        if (typeof object == 'object') {
            if (object instanceof Array) {
                if (object.length == 2 && typeof object[0] == 'function' && object[1] instanceof Array) {
                    let keys: string[] = object[1];
                    let vs: any[] = [];
                    let fn: any = object[0];
                    for (let i = 0; i < keys.length; i++) {
                        let v = this.get(keys[i]);
                        vs.push(v);
                    }
                    return fn.apply(this, vs);
                }
                let vs: any[] = [];
                for (let item of object) {
                    let v = this.evaluate(item);
                    vs.push(v);
                }
                return vs;
            } else {
                let a: any = {};
                for (let key in object) {
                    a[key] = this.evaluate(object[key]);
                }
                return a;
            }
        }
        return object;
    }

    get(key: string): any {
        let v = this._object[key];
        if (v === undefined) {
            if (this._parent) {
                v = this._parent.get(key);
            }
        }
        return v;
    }

    set(key: string, value: any): void {
        if (value === undefined) {
            delete this._object[key];
        } else {
            this._object[key] = value;
        }
    }

    setGlobal(key: string, value: any): void {
        if (this._parent) {
            this._parent.setGlobal(key, value);
        } else if (value === undefined) {
            delete this._object[key];
        } else {
            this._object[key] = value;
        }
    }

    setWithKeys(keys: string[], value: any): void {

        if (keys.length == 0) {
            return;
        }

        if (value === undefined) {

            if (keys.length == 1) {
                let key = keys[0];
                delete this._object[key];
                return;
            }

            let index = 0;
            let key = keys[index++];
            let object = this.get(key);
            while (index < keys.length - 1 && typeof object == 'object') {
                key = keys[index];
                object = object[key];
                index++;
            }
            if (index < keys.length && typeof object == 'object') {
                key = keys[index];
                delete object[key];
            }

        } else {

            if (keys.length == 1) {
                let key = keys[0];
                this._object[key] = value;
                return;
            }

            let index = 0;
            let key = keys[index++];
            let object = this.get(key);
            if (typeof object != 'object') {
                object = this._object[key] = {};
            }
            while (index < keys.length - 1) {
                key = keys[index];
                let v = object[key];
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
    }

}

