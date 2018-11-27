module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');

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

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: [
                            'public/**',
                            'config/**',
                            'controller/**',
                            'documents/**',
                            'models/**',
                            'routes/**',
                            'views/**',
                            'app.js',
                            'Gruntfile.js',
                            'Gruntfile.js',
                            'package.json',

                        ],
                        dest: 'build/zip/'
                    },
                    {
                        expand: true,
                        cwd: '../Data-Project-Config/',
                        src: [
                            '.ebextensions/**',
                            'config/**'
                        ],
                        dest: 'build/zip/'
                    }
                ]
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'release-beta.zip'
                },
                expand: true,
                cwd: 'build/zip',
                src: ['**/*', '.*/*'],
                dest: '',
            }
        },

        clean: ['build', 'public/dist', 'release-beta.zip'],



    };

    grunt.registerTask("configureBabel", "configures babel options", function() {
        config.babel.excelFrontend.options.inputSourceMap = grunt.file.readJSON('build/excel-web.js.map');
    });

    grunt.initConfig(config);

    // mkdir for zip archive
    grunt.registerTask("mkdir", function () {
        grunt.file.mkdir('build/zip/temp');
        grunt.file.mkdir('build/zip/uploads');
    });

    grunt.registerTask("default", ["clean", "concat", "configureBabel", "babel"]);
    grunt.registerTask("prod", ["clean", "concat", "configureBabel", "babel", "copy", "mkdir", "compress"]);


};
