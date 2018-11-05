module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    let config = {
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                sourceMap: true
            },
            js: {
                src: ['public/moh.js/handsontable/**/*.js'],
                dest: 'build/excel-web.js'
            },


        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env'],
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/moh.js/',
                        src: '*.js',
                        dest: 'public/dist/'
                    },
                ]
            },
            excelFrontend: {
                options: {
                },
                src: ['build/excel-web.js'],
                dest: 'public/dist/excel-web.js'
            }

        },

        uglify: {
            options: {
                sourceMap: true,
                sourceMapIncludeSources: true,
                sourceMapIn: 'public/dist/excel-web.js.map'
            },
            dist: {
                src: 'public/dist/excel-web.js',
                dest: 'public/dist/excel-web.min.js'
            }
        },

        watch: {
            scripts: {
                files: ['public/moh.js/*.js'],
                tasks: ['babel'],
                options: {
                    spawn: false,
                    interrupt: true,
                },
            },
            excelFrontend: {
                files: ['public/moh.js/handsontable/**/*.js'],
                tasks: ["concat", "configureBabel", "babel"],
                options: {
                    spawn: false,
                    interrupt: true,
                },
            },
        },

    };

    grunt.registerTask("configureBabel", "configures babel options", function() {
        config.babel.excelFrontend.options.inputSourceMap = grunt.file.readJSON('build/excel-web.js.map');
    });

    grunt.initConfig(config);

    grunt.registerTask("default", ["concat", "configureBabel", "babel"]);

};
