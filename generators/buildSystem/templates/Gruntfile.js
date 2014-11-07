(function () {
    "use strict";
    module.exports = function (grunt) {
        /**
         * In the long run this may be factored out into a separately distributed library
         *
         * Required keys in opts:
         *  name: name of the task set, to be interpolated into task name like generate_$NAME_headers
         *        must match the name of the .module file
         *  path: where the module exists on the file system, relative to the Gruntfile
         *  language: source language (like haxe, typescript)
         *  package: only required when language=haxe, the root package path to include in the compile step, passed o haxe --macro "include('$PACKAGE')"
         *
         * Optional keys in opts:
         *  dependencies: a list of module paths this module depends on, relative to this module
         *
         * TODO pass module dependencies to grunt, so it can resolve the correct task order
         *      right now the calls to spaghettiTaskSet need to be in the correct order (dependency before dependent)
         * TODO generate clean tasks
         */
        function spaghettiTaskSet() {
            var opts = this.data,
                spec,
                compileCommand = {
                    "typescript": 'find . -name \'*.ts\' | xargs tsc --out build/' + opts.name + '.js',
                    "haxe": "haxe -cp build/spaghetti/generated-headers -cp src/main/haxe -js build/" + opts.name + ".js --macro \"include('" + opts.package + "')\"",
                    "kotlin": "cd ..; ./kotlinc-js.sh " + opts.path + " " + opts.name
                };

            spaghettiTaskSet.modulePaths.push(opts.path);

            grunt.config("exec.Clean" + opts.name, {
                command: "rm -rf build",
                cwd: opts.path
            });

            spec = {
                command: "spaghetti generate headers --definition src/main/spaghetti/" + opts.name + ".module --language " + opts.language + " --output build/spaghetti/generated-headers",
                cwd: opts.path
            };
            if (opts.hasOwnProperty("dependencies")) {
                spec.command += " --dependency-path " + opts.dependencies.map(function (p) { return p + "/bundle"; }).join(':');
            }
            grunt.config("exec.Generate" + opts.name + "Headers", spec);

            grunt.config("exec.Compile" + opts.name, {
                command: compileCommand[opts.language],
                cwd: opts.path
            });

            spec = {
                command: "spaghetti bundle --definition src/main/spaghetti/" + opts.name + ".module --language " + opts.language + " --source build/" + opts.name + ".js --output bundle",
                cwd: opts.path
            };
            if (opts.hasOwnProperty("dependencies")) {
                spec.command += " -d " + opts.dependencies.map(function (p) { return p + "/bundle"; }).join(':');
            }
            grunt.config("exec.Bundle" + opts.name, spec);
        }
        spaghettiTaskSet.modulePaths = [];

        grunt.registerMultiTask('spaghetti', spaghettiTaskSet);

        grunt.registerTask('spaghetti-package', function () {
            grunt.config('exec.SpaghettiPackage', 'spaghetti package --wrapper node --execute --main {{mainPackage}} --output app --dependency-path ' + spaghettiTaskSet.modulePaths.map(function (p) { return p + "/bundle"; }).join(':'));
        });

        // Actual project definition starts here

        grunt.initConfig({
            spaghetti: {
                //Module {{name}}{{#each modules}}
                "{{name}}": {
                    name: "{{name}}",
                    path: "{{name}}",
                    language: "{{language}}",
                    package: "{{package}}"
                },
                //EOF Module {{name}}{{/each}}
                "{{mainModule.name}}": {
                    name: "{{mainModule.name}}",
                    path: "{{mainModule.name}}",
                    language: "{{mainModule.language}}",
                    package: "{{mainModule.package}}",
                    //Dependencies{{#if mainModule.dependencies}}
                    dependencies: [
                        //{{#each mainModule.dependencies}}
                        "{{path}}",
                        //{{/each}}
                    ]
                    //EOF Dependencies{{/if}}
                }
            }
        });

        grunt.loadNpmTasks('grunt-exec');
        grunt.registerTask('default', ['spaghetti', 'spaghetti-package', 'exec']);
        grunt.registerTask('clean', ['exec:clean']);
    };
}());

