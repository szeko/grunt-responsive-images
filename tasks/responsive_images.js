/*
 * grunt-responsive-images
 * https://github.com/andismith/grunt-responsive-images
 *
 * Copyright (c) 2013 andismith
 * Licensed under the MIT license.
 */

'use strict';

var _     = require('lodash'),
    im    = require('node-imagemagick'),
    async = require('async'),
    path  = require('path');

module.exports = function(grunt) {

  var DEFAULT_OPTIONS = {
    separator: '-',
    sizes: [{
        name: 'small',
        width: 320,
        height: 240
      },{
        name: 'medium',
        width: 640,
        height: 480
      },{
        name: 'large',
        width: 1024,
        height: 768
      }]
  };

  // check if there are any items in our array
  function isValidArray(obj) {
    return (_.isArray(obj) && obj.length > 0);
  }

  // check whether we've been given any valid size values
  function isValidSize(obj) {
    return _.isNumber(obj.width) ||
      _.isNumber(obj.height) ||
      _.isString(obj.width) ||
      _.isString(obj.height);
  }

  // create a name to suffix to our file.
  function getName(name, width, height, separator, suffix) {

    // handle empty separator as no separator
    if (typeof separator === 'undefined') {
      separator = '';
    }

    // handle empty suffix as no suffix
    if (typeof suffix === 'undefined') {
      suffix = '';
    }

    if (name) {
      return separator + name + suffix;
    } else {
      if (width && height) {
        return separator + width + 'x' + height + suffix;
      } else {
        return separator + (width || height) + suffix;
      }
    }
  }

  grunt.registerMultiTask('responsive_images', 'Images at various responsive sizes', function() {

    // Merge task-specific and/or target-specific options with these defaults.

    var done = this.async();
    var series = [];
    var options = this.options(DEFAULT_OPTIONS);
    var that = this;
    var tally = {};

    if (!isValidArray(options.sizes)) {
      return grunt.fail.warn('No sizes have been defined.');
    }

    options.sizes.forEach(function(s) {

      // consts
      var DEFAULT_SIZE_OPTIONS = {
        quality: 1
      };

      // variable
      var sizeOptions = _.clone(_.extend(DEFAULT_SIZE_OPTIONS, s));
      var sizingMethod = 'resize';

      if (!isValidSize(s)) {
        return grunt.fail.warn('Size is invalid');
      }

      // use crop if both width and height are specified.
      if (s.width && s.height) {
        sizingMethod = 'crop';
      }

      // create a name suffix for our image, called outputName so we can still use name
      sizeOptions.outputName = getName(s.name, s.width, s.height, options.separator, s.suffix);

      // set name to outputName if one does not exist
      if (typeof sizeOptions.name === 'undefined') {
        sizeOptions.name = sizeOptions.outputName;
      }

      tally[sizeOptions.name] = 0;

      // Iterate over all specified file groups.
      that.files.forEach(function(f) {

        var extName = path.extname(f.dest),
            srcPath = f.src[0],
            baseName = path.basename(srcPath, extName), // filename without extension
            fileName,
            dirName,
            dstPath,
            subDir = "";

        if (f.custom_dest) {
          sizeOptions.path = f.src[0].replace(new RegExp(f.orig.cwd), "").replace(new RegExp(path.basename(srcPath)+"$"), "");
          grunt.template.addDelimiters('size', '{%', '%}');
          dirName = grunt.template.process(f.custom_dest, {
            delimiters: 'size',
            data: sizeOptions
          });
          dstPath = path.join(dirName, subDir, baseName + extName);
        }

        else {
          dirName = path.dirname(f.dest);
          switch(typeof s.rename) {
            // check if file should be renamed with sizeOptions
            case 'boolean':
              if (s.rename === false) { fileName = baseName; }
              break;
            // Apply custom rename function if set
            case 'function':
              fileName = s.rename.call(this, baseName, s.width, s.height);
              // Use original filename if custom filename is invalid
              if (typeof fileName !== 'undefined' &&
                  String(fileName).length>0 &&
                  !/[^A-Za-z0-9.-]/.test(fileName)) { break; }

            default:
              fileName = baseName + sizeOptions.outputName;
          }
          dstPath = path.join(dirName, subDir, fileName + extName);
        }

        var imageOptions = {};
        
        // more than 1 source.
        if (f.src.length > 1) {
          return grunt.fail.warn('Unable to resize more than one image in compact or files object format.\n'+
            'For multiple files please use the files array format.\nSee http://gruntjs.com/configuring-tasks');
        }

        // Make directory if it doesn't exist.
        if (!grunt.file.isDir(path.join(dirName, subDir))) {
          grunt.file.mkdir(path.join(dirName, subDir));
        }

        imageOptions = {
          srcPath:  srcPath,
          dstPath:  dstPath,
          format:   extName.replace('.', '')
        };

        // combine image options with size options.
        imageOptions = _.extend(imageOptions, sizeOptions);

        series.push(function(callback) {
          im[sizingMethod](imageOptions, function(error, stdout, stderr) {
            if (error) {
              grunt.fail.warn(error.message);
            } else {
              grunt.verbose.ok('Responsive Image: ' + srcPath + ' now '+ dstPath);
              tally[sizeOptions.name]++;
            }
            return callback();
          });
        });
      });
      series.push(function(callback) {
        if (tally[sizeOptions.name]) {
          grunt.log.writeln('Created ' + tally[sizeOptions.name].toString().cyan + ' files for size ' + sizeOptions.name);
        }
        return callback();
      });
    });

    async.series(series, done);
  });
};
