
declare namespace ik {

    class Context {

        constructor(object?: any, parent?: Context)

        pushContext(object?: any): Context

        popContext(): Context | undefined

        evaluate(object: any): any

        get(key: string): any

        set(key: string, value: any): void

        setWithKeys(keys: string[], value: any): void

        setGlobal(key: string, value: any): void

    }


    class Logic {

        constructor(exec: (...args: any[]) => any, ...args: any[])

        then(onfulfilled?: Logic, onrejected?: Logic): Logic

        exec(ctx?: Context): Promise<any>
    }

    function exec(object: any, name: string, input: any | Context): Promise<any>

    interface Options {
        [key: string]: any
    }

    function app(): Logic

    function set(options: Options): Logic

    function logic(exec: (...args: any[]) => any, ...args: any[]): Logic

    interface HttpHeader {
        [key: string]: string
    }

    interface HttpOptions {
        [key: string]: any
        url: string
        method?: string
        data?: any
        header?: HttpHeader
    }

    function http(options: HttpOptions): Logic

    enum OpenType {
        navigateTo = "navigateTo",
        redirectTo = "redirectTo"
    }

    interface EnvInterface {
        [key: string]: any
        platform: string
        model: string
        screenWidth: number
        screenHeight: number
        statusBarHeight: number
    }

    function open(url: any, openType?: OpenType): Logic

    function close(delta?: any): Logic

    function env(): Logic

    function getStore(options: Options): Logic

    function setStore(options: Options): Logic


}