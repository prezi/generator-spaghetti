module {{package}} {
    export class {{name}}Impl {
        sayHello(to:string):string {
            return "TypeScript in module {{name}} says: Hello " + to + "!";
        }
    }

    export class {{name}}Module {
        static create{{name}}():{{package}}.{{name}} {
            return new {{name}}Impl();
        }
    }
}