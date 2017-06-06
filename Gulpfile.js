var gulp = require('gulp');
var compass = require('gulp-compass');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var size = require('gulp-size');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var changed = require('gulp-changed');
var bs = require('browser-sync');
var plumber = require('gulp-plumber');


gulp.task('sass', function() {
    return gulp.src('./sass/*.scss')
    .pipe(plumber())
    .pipe(compass({
      css: './css',
      sass: './sass',
      image: './images'
    }))
    .pipe(csso())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(size())
    .pipe(gulp.dest('./css'));
});

gulp.task('js', function() {
    return gulp.src('./js/main.js')
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify({
        compress: {
            warnings: false,
            drop_console: true
        }
    }))
    .pipe(size())
    .pipe(gulp.dest('./js'));
});

gulp.task('js:global', function() {
    return gulp.src([
        './js/libs/jquery-3.1.1.min.js',
        './js/libs/modal.min.js',
        './js/libs/modal-resize.min.js',
        './js/libs/modal-maxwidth.min.js',
        './js/libs/easeljs-NEXT.min.js',
        './js/libs/tweenjs-NEXT.min.js',
        './js/libs/preloadjs-NEXT.min.js'
    ])
    .pipe(plumber())
    .pipe(concat('global.js', {newLine: ';'}))
    .pipe(size())
    .pipe(gulp.dest('./js/'));
});

gulp.task('uglify', function() {
    return gulp.src([
        './js/libs/modal.js',
        './js/libs/modal-resize.js',
        './js/libs/modal-maxwidth.js'
    ])
    .pipe(plumber())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(size())
    .pipe(gulp.dest('./js/libs/'));
});

gulp.task('sass:watch', ['sass'], function() {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('js:watch',['js', 'js:global'], function() {
    gulp.watch('./js/**/*.js', ['js', 'js:global']);
});