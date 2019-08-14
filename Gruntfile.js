module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-run');

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
                exec: 'npm run build:frontend'
            },

            'buildFrontend-pivotal': {
                exec: 'npm run build:frontend-pivotal'
            },
            pivotal: {
                exec: 'cd ./build/zip && cf push mohltc -c "node app.js"'
            }
        },

    });

    // mkdir for zip archive
    grunt.registerTask("mkdir", function () {
        grunt.file.mkdir('build/zip/temp');
        grunt.file.mkdir('build/zip/uploads');
        grunt.file.mkdir('build/zip/public/react');
    });

    grunt.registerTask("prod", ["clean", "run:report", "run:buildFrontend",
        "mkdir", "copy:main", "compress"]);
    grunt.registerTask("aws", ["clean"]);

    grunt.registerTask("pivotal:build", ["clean", "run:buildFrontend-pivotal",
        "mkdir", "copy:main"]);

    grunt.registerTask("pivotal:publish", ["run:pivotal"]);
    grunt.registerTask("pivotal", ["pivotal:build", "pivotal:publish"]);
};
