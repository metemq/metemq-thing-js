var gulp = require('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var tsconfig = require('./tsconfig');

var tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});

var outDir = tsconfig.compilerOptions.outDir;

gulp.task('build', function() {
    var tsResult =
        tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest(outDir));
});

gulp.task('run', ['build'], function() {
    var stream = nodemon({
        script: 'dist/', // run ES5 code
        ext: 'ts',
        watch: 'src', // watch ES2015 code
        tasks: ['build'] // compile synchronously onChange
    });

    return stream;
});

gulp.task('watch', ['build', 'mocha'], function() {
    gulp.watch(['src/**'], ['build', 'mocha']);
});

gulp.task('mocha', function() {
    return gulp.src(['build/test/*.js'], {
            read: false
        })
        .pipe(mocha({
            reporter: 'list'
        }))
        .on('error', gutil.log);
});
