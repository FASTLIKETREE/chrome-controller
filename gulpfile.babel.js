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

const src = './src'
const srccontent = './src/content'
const build = './build'
const dist = './dist'
const test = './test'

gulp.task('clean', function() {
  return del([build, dist])
})

gulp.task('lint', function() {
  return gulp.src([src + '/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

//We can split out the html copying and transform it in the future
gulp.task('static', function(){
  const popup = glob.sync(src + '/popup/*.html')
  const assets = glob.sync('./static/*')

  return gulp.src([...popup, ...assets, src + '/manifest.json'])
    .pipe(gulp.dest(dist));
})

gulp.task('bundle', function () {
  // set up the browserify instance on a task basis
  var entryPoints = glob.sync(build + '/*.js')
  //console.log(entryPoints)
  var b = browserify({
    entries: entryPoints,
    debug: true
  });

  return b.bundle()
    .pipe(source('background.js'))
    .pipe(buffer())
    .pipe(gulp.dest(dist));
});

gulp.task('babel', function() {
  return gulp.src([src + '/*.js', srccontent + '/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(build))
})

gulp.task('babelcontent', function() {
  return gulp.src([srccontent + '/*.js'])
    .pipe(babel())
    .pipe(gulp.dest(dist))
})

gulp.task('watch', ['deploy'], function() {
  return watch([src + '/*', srcpopup + '/*', srccontent + '/*'], function(){
    runSequence(
      'clean',
      'babel',
      'babelpopup',
      'babelcontent',
      'static',
      'bundle',
      'bundlepopup'
    )
  })
})

gulp.task('deploy', function(done){
  runSequence(
    'clean',
    'babel',
    'babelcontent',
    'static',
    'bundle',
    done 
  )
})

gulp.task('default', ['deploy'])
