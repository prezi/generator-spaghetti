(function () {
    "use strict";
    var common = require('../../common');

    module.exports = common.MyBase.extend({
        initializing: {
            abortIfInitialized: function () {
                if (this.isInitialized()) {
                    throw "A Spaghetti project is already initialized here. You can use `yo spaghetti:createModule` to add further modules.";
                }
            },
            compose: function () {
                this.composeWith('spaghetti:createModule', {
                    options: {
                        moduleTemplate: 'Main',
                        modulePackage: 'org.example.main'
                    }
                });
            }
        }
    });
}());
