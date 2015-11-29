(function () {
  'use strict';

  var gulp = require('gulp')
    , del = require('del')
    , connect = require('gulp-connect')
    , Server = require('karma').Server;

  gulp.task('watch', ['serve'], function () {
    gulp.watch(['src/**/*.js', 'src/**/*.css', 'src/**/*.html'], ['test']);
  });

  gulp.task('test', function (done) {
    new Server({
      configFile: __dirname + '/karma.conf.js',
      singleRun: true
    }, done).start();
  });

  gulp.task('clean', function () {
    return del(['dist']);
  });

  gulp.task('serve', function() {
    connect.server({
      root: 'src',
      livereload: true,
      port: 3000,
      fallback: 'src/index.html'
    });
  });
})();
