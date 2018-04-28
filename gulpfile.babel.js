import del from 'del'
import gulp from 'gulp'
import babel from 'gulp-babel'
import eslint from 'gulp-eslint'
import mocha from 'gulp-mocha'
import gutil from 'gulp-util'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import browserify from 'browserify'
import runSequence from 'run-sequence'
import watch from 'gulp-watch'
import glob from 'glob'

//server
const srcServer = './src/server'
const buildServer = './build/server'
const distServer = './dist/server'

gulp.task('babelServer', function() {
  return gulp.src([srcServer + '/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(buildServer))
})

gulp.task('distServer', function() {
  return gulp.src([buildServer + '/*.js'])
    .pipe(gulp.dest(distServer))
})

gulp.task('server', function(cb){
  runSequence(
    'babelServer',
    'distServer',
    cb
  )
})

//extension
const srcExtension = './src/extension'
const buildExtension = './build/extension'
const distExtension = './dist/extension'

gulp.task('static', function() {
  return gulp.src([srcExtension + '/manifest.json'])
    .pipe(gulp.dest(distExtension))
})

gulp.task('babelExtension', function() {
  return gulp.src([srcExtension + '/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(buildExtension))
})

gulp.task('bundle', function () {
  var entryPoints = glob.sync(buildExtension + '/*.js')
  var b = browserify({
    entries: entryPoints,
    debug: true
  })

  return b.bundle()
    .pipe(source('background.js'))
    .pipe(buffer())
    .pipe(gulp.dest(distExtension));
})

gulp.task('extension', function(cb){
  runSequence(
    'babelExtension',
    'static',
    'bundle',
    cb
  )
})

//common
const src = './src'
const build = './build'
const dist = './dist'

gulp.task('clean', function() {
  return del([build, dist])
})

gulp.task('lint', function() {
  return gulp.src([srcServer + '/**/*.js', src + '/watcher.js'])
  //return gulp.src([srcServer + '/**/*.js', srcExtension + '/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('watch', ['deploy'], function() {
  return watch([src + '/*', srcpopup + '/*', srccontent + '/*'], function(){
    runSequence(
      'clean',
      'babel',
      'babelcontent',
      'static',
      'bundle',
      'bundlepopup'
    )
  })
})

//watcher
gulp.task('babelWatcher', function() {
  return gulp.src([src + '/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(build))
})

gulp.task('distWatcher', function() {
  return gulp.src([build + '/*.js'])
    .pipe(gulp.dest(dist))
})

gulp.task('watcher', function(cb){
  runSequence(
    'babelWatcher',
    'distWatcher',
    cb
  )
})

gulp.task('default', ['server', 'extension', 'watcher'])
