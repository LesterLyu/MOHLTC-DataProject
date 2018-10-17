module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks
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
        }
    });

    grunt.registerTask("default", ["babel"]);

};
