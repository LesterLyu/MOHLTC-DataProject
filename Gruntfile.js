const {pivotal, aws} = require('./config/cloud');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-env');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
                            'test/**',
                            'mochawesome-report/**',
                            'app.js',
                            'Gruntfile.js',
                            'package.json',
                            'yarn.lock',
                        ],
                        dest: 'build/zip/'
                    },
                    {
                        expand: true,
                        cwd: '../Data-Project-Config/',
                        src: [
                            '.ebextensions/**', // amazon beanstalk configs
                            'config/**'
                        ],
                        dest: 'build/zip/'
                    },
                    {
                        expand: true,
                        cwd: './frontend/build/',
                        src: [
                            '**'
                        ],
                        dest: 'build/zip/public/react'
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
                dest: './',
            }
        },

        clean: ['build', 'public/dist', 'release-beta.zip'],

        run: {
            report: {
                exec: '"./node_modules/.bin/mocha" ./test/main.js ./test/ --recursive --exit --check-leaks -R mochawesome'
            },
            buildFrontend: {
                exec: 'yarn run build:frontend'
            },

            pivotal: {
                exec: `cd ./build/zip && cf push ${pivotal.appName} -c "node app.js"`
            }
        },

        env: {
            aws: {
                NODE_ENV: 'production',
                SERVER_URL: aws.serverUrl,
                PUBLIC_URL: aws.frontendUrl,
            },
            pivotal: {
                NODE_ENV: 'production',
                SERVER_URL: pivotal.serverUrl,
                PUBLIC_URL: pivotal.frontendUrl,
            }
        }

    });

    // mkdir for zip archive
    grunt.registerTask("mkdir", function () {
        grunt.file.mkdir('build/zip/temp');
        grunt.file.mkdir('build/zip/uploads');
        grunt.file.mkdir('build/zip/public/react');
    });

    grunt.registerTask("build:aws", ["clean", "run:report", "env:aws", "run:buildFrontend", "mkdir", "copy:main", "compress"]);

    grunt.registerTask("pivotal:build", ["clean", "run:report", "env:pivotal", "run:buildFrontend", "mkdir", "copy:main"]);
    grunt.registerTask("pivotal:publish", ["run:pivotal"]);
    grunt.registerTask("build:pivotal", ["pivotal:build", "pivotal:publish"]);
};
