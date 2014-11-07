package {{package}}

class {{name}}Impl : {{name}} {
    override fun sayHello(to: String): String = "Kotlin in module {{name}} says: Hello, ${to}!"
}

object {{name}}Module {
    fun create{{name}}(): {{name}} = {{name}}Impl()
}
