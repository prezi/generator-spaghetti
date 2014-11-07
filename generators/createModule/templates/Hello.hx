package {{package}};

import {{package}}.{{name}};

class {{name}}Module {
    public static function create{{name}}():{{name}} {
        return new {{name}}Impl();
    }
}

class {{name}}Impl implements {{name}} {
    public function new() {}

    public function sayHello(to: String): String {
        return "Haxe in module {{name}} says: Hello " + to + "!";
    }
}
