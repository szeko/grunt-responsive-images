/*
 * grunt-responsive-images
 * https://github.com/andismith/grunt-responsive-images
 *
 * Copyright (c) 2013 andismith
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    responsive_images: {
      default_options: {
        options: {
        },
        files: {
          'tmp/default_options/minions.jpg': 'test/assets/default_options/minions.jpg'
        }
      },
      file_wildcard_options: {
        options: {
        },
        files: [{
          expand: true,
          src: ['file_wildcard_options/**.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },
      custom_options: {
        options: {
          sizes: [{
            width: 110,
            name: "small",
            quality: 0.4
          },{
            width: 220,
            quality: 1
          },{
            width: 330,
            name: "large",
            quality: 0.8
          },{
            width: 660,
            name: "large",
            suffix: "_x2",  // retina gfx
            quality: 0.5
          }]
        },
        files: [{
          expand: true,
          src: ['custom_options/**.{jpg,gif,png}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }]
      },
      custom_dest_width: {
        options: {
          sizes: [{
            width: 320
          },{
            width: 640
          },{
            width: 1024
          }]
        },
        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_dest_width/',
          custom_dest: 'tmp/custom_dest_width/{%= width %}/'
        }]
      },
      custom_dest_name: {
        options: {
          sizes: [{
            width: 100,
            name: "leo"
          },{
            width: 200,
            name: "donnie"
          },{
            width: 400,
            name: "raph"
          }]
        },
        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_dest_name/',
          custom_dest: 'tmp/custom_dest_name/{%= name %}/'
        }]
      },
      custom_dest_path: {
        options: {
          sizes: [{
              width: 320,
            },{
              width: 640,
            },{
              width: 1024,
            }]
        },
        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_dest_path/',
          custom_dest: 'tmp/custom_dest_path/{%= width %}/{%= path %}'
        }]
      },
      custom_rename: {
        options: {
          sizes: [{
              width: '100%',
              rename: function(name, width, height) { return width; }
            }]
        },
        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_rename/',
          dest: 'tmp/custom_rename/'
        }]
      },
      custom_rename_none: {
        options: {
          sizes: [{
              width: '100%',
              rename: false
            }]
        },
        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'test/assets/custom_rename/',
          dest: 'tmp/custom_rename_none/'
        }]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/**/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'responsive_images', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
