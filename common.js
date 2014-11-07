(function () {
    "use strict";
    var generators = require('yeoman-generator'),
        Handlebars = require('handlebars'),
        fs = require('fs'),
        ModuleStore = function (config, key) {
            this.config = config;
            this.key = key || 'spaghetti-modules';
            if (!this.get()) { this.set({}); }
        };
    ModuleStore.prototype.get = function () { return this.config.get(this.key); };
    ModuleStore.prototype.set = function (value) {
        this.config.set(this.key, value);
        this.config.forceSave();
    };
    ModuleStore.prototype.addModule = function (spec) {
        var data = this.get();
        data[spec.name] = spec;
        this.set(data);
    };
    ModuleStore.prototype.reload = function () {
        function readJSON(path) {
            if (fs.existsSync(path)) {
                return JSON.parse(fs.readFileSync(path, 'utf8'));
            }
            return {};
        }
        this.config._store = readJSON(this.config.path)[this.config.name] || {};
    };
    if (!(String.prototype.capitalize instanceof Function)) {
        String.prototype.capitalize = function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };
    }
    module.exports = {
        ModuleStore: ModuleStore,
        MyBase: generators.Base.extend({
            isInitialized: function () {
                return this.config.get("spaghetti-modules");
            },
            newModuleStore: function () {
                return new ModuleStore(this.config);
            },
            tmpl: function (srcFile, dstFile, context) {
                var raw = this.src.read(srcFile),
                    template = Handlebars.compile(raw),
                    rendered = template(context);
                this.dest.write(dstFile, rendered);
            },
            promptToConfig: function (opts) {
                var done = this.async();
                opts.default = this.config.get(opts.name) || opts.default;
                this.prompt(opts, function (answers) {
                    this.config.set(answers);
                    this.config.forceSave();
                    done();
                }.bind(this));
            }
        })
    };
}());

