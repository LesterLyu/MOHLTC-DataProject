module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/moh.js/',
                        src: '**/*.js',
                        dest: 'public/dist/'
                    }
                ]
            }
        },

        watch: {
            scripts: {
                files: ['public/moh.js/**/*.js'],
                tasks: ['babel'],
                options: {
                    spawn: false,
                    interrupt: true,
                },
            },
        },

    });

    grunt.registerTask("default", ["babel"]);

};
