(function () {
    "use strict";
    var common = require('../../common');
    module.exports = common.MyBase.extend({
        initializing: {
            moduleStore: function () {
                this.modules = new common.ModuleStore(this.config);
            }
        },
        prompting: {
            buildSystem: function () {
                if (this.config.get('buildSystem') !== undefined) {
                    return;
                }
                this.promptToConfig({
                    type: 'list',
                    name: 'buildSystem',
                    message: 'Build system to use in the new project:',
                    //choices: ['bash script', 'gradle', 'grunt']
                    choices: ['grunt']
                });
            }
        },
        writing: {
            gruntfile: function () {
                var modules, mainPackage = this.config.get('mainPackage'), moduleNames, mainModuleName, mainModule;
                if (this.config.get('buildSystem') !== 'grunt') {
                    return;
                }
                this.src.copy('kotlinc-js.sh', 'kotlinc-js.sh');
                this.modules.reload();
                modules = this.modules.get();
                moduleNames = Object.keys(modules);

                if (mainPackage) {
                    // When adding a new module
                    mainModuleName = moduleNames.filter(function (it) {
                        return modules[it].package === mainPackage;
                    })[0];
                } else {
                    // When creating the first module
                    mainModuleName = moduleNames[0];
                    mainPackage = modules[mainModuleName].package;
                }
                // We'll handle the main module and the rest separately
                mainModule = modules[mainModuleName];
                delete modules[mainModuleName];
                moduleNames = moduleNames.filter(function (it) { return it !== mainModuleName; });
                // Make sure the main module is at the end
                // The main module depends on everything
                mainModule.dependencies = moduleNames.map(function (name) { return {path: '../' + name}; });
                this.tmpl("Gruntfile.js", "Gruntfile.js", {
                    mainPackage: mainPackage,
                    mainModule: mainModule,
                    modules: modules
                });
            }
        },
        install: {
            npmInstall: function () {
                var done = this.async();
                this.npmInstall(['grunt-exec'], {saveDev: true}, done);
            }
        }
    });
}());
