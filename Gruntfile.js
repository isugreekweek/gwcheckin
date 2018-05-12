module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      options: {
        style: 'compressed',
        sourcemap: 'none'
      },
      build: {
        src: 'webapp/sass/main.scss',
        dest: 'webapp/gw2016.css'
      }
    }
  });

  // Load the plugins for "sass"
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Default task(s).
  grunt.registerTask('default', ['sass']);

};