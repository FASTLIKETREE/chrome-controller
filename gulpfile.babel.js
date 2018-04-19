import childProcess from 'child_process'
import gulp from 'gulp'
import runSequence from 'run-sequence'
import babel from 'gulp-babel'

const src = './src'
const images = './images'
const build = './build'
const dist = './dist'


gulp.task('js', function(){
  return gulp.src(['./index.js', src + '/**/*.js'])
  .pipe(babel())
  .pipe(gulp.dest(dist))
})

gulp.task('build', function(callback) {
  runSequence(
    'js',
    callback
  )
})

gulp.task('default', ['build'])
