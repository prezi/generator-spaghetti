(function () {
    "use strict";
    var common = require('../../common');
    module.exports = common.MyBase.extend({
        initializing: {
            declareOptions: function () {
                this.option('moduleTemplate', {
                    type: String,
                    defaults: 'Hello'
                });
                this.option('modulePackage', {
                    type: String,
                    defaults: 'org.example.hello'
                });
            },
            moduleStore: function () {
                this.modules = new common.ModuleStore(this.config);
            },
            moduleSpec: function () {
                this.spec = {
                    language: null,
                    package: null,
                    name: null
                };
            },
            extensions: function () {
                this.extensions = {
                    kotlin: 'kt',
                    typescript: 'ts',
                    haxe: 'hx'
                };
            },
            compose: function () {
                this.composeWith('spaghetti:buildSystem');
            }
        },
        prompting: {
            language: function () {
                var done = this.async();
                this.prompt({
                    type: 'list',
                    name: 'language',
                    message: 'Language to use in the module:',
                    choices: ['kotlin', 'typescript', 'haxe']
                }, function (answers) {
                    this.spec.language = answers.language;
                    done();
                }.bind(this));
            },
            packageName: function () {
                var done = this.async();
                this.prompt({
                    name: 'package',
                    message: 'Package:',
                    default: this.options.modulePackage
                }, function (answers) {
                    this.spec.package = answers.package;
                    done();
                }.bind(this));
            }
        },
        configuring: {
            moduleName: function () {
                this.spec.name = this.spec.package.split('.').pop().capitalize();
            },
            addToModuleStore: function () {
                this.modules.addModule(this.spec);
            },
            mainPackage: function () {
                if (this.options.moduleTemplate === 'Main') {
                    this.config.set("mainPackage", this.spec.package);
                }
            }
        },
        writing: {
            writeModuleImpl: function () {
                var extension = this.extensions[this.spec.language],
                    template = this.options.moduleTemplate + "." + extension,
                    dstFile = [this.spec.name, "src", "main", this.spec.language]
                        .concat(this.spec.package.split('.'))
                        .concat([this.spec.name + 'Module.' + extension])
                        .join('/');
                this.tmpl(template, dstFile, this.spec);
            },
            writeModule: function () {
                var template = this.options.moduleTemplate + ".module",
                    dstFile = [this.spec.name, "src", "main", "spaghetti", this.spec.name + ".module"].join('/');
                this.tmpl(template, dstFile, this.spec);
            }
        }
    });
}());
