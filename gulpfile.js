var gulp = require('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var tsconfig = require('./tsconfig');

var tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});

var outDir = tsconfig.compilerOptions.outDir;


gulp.task('default', ['compile']);

gulp.task('compile', function() {
    var tsResult =
        tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest(outDir));
});

gulp.task('watch', ['compile'], function () {
  var stream = nodemon({
                 script: 'dist/' // run ES5 code
							 , ext: 'ts'
               , watch: 'src' // watch ES2015 code
               , tasks: ['compile'] // compile synchronously onChange
						 });

  return stream;
})
