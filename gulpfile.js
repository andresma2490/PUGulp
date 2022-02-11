const production = true
const fs = require("fs");
const gulp = require('gulp');

const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');

const pug = require('gulp-pug');

const sass = require('gulp-sass')(require('sass'));
const purgecss = require('gulp-purgecss');

const babel = require('gulp-babel');
const terser = require('gulp-terser');

const imagemin = require('gulp-imagemin');


gulp.task('pug', () => {
    return gulp
        .src('./src/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: !production,
        }))
        .pipe(gulp.dest('./public/'));
})

/** STATIC **/
gulp.task('scss', ()=>{
    return gulp
        .src('./src/static/scss/main.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./public/static/css/'));
})

gulp.task('purgecss', ()=>{
    return gulp
        .src('./public/static/css/*.css')
        .pipe(plumber())
        .pipe(purgecss({
            content: ['./public/*.html']
        }))
        .pipe(rename({ basename:'main', suffix: '.purged' }))
        .pipe(gulp.dest('./public/static/css/'))
        .pipe(browserSync.stream())
})

gulp.task('js', ()=>{
    return gulp
        .src('./src/static/js/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['@babel/env']
        }))  
        .pipe(terser()) // compress js
        .pipe(gulp.dest('./public/static/js/'))
})

gulp.task('images', ()=>{
    return gulp
        .src('./src/static/images/*')
        .pipe(imagemin()) // see default config at npmjs.com
        .pipe(gulp.dest('./public/static/images/'))
})


/** DEV TOOLS **/
gulp.task('server', ()=>{
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
})


gulp.task('default', ()=>{
    const tasks = ['pug', 'scss', 'purgecss', 'js', 'images', 'server']
    let build;

    fs.access('./public', (err) => {
        err ? build = gulp.series(...tasks) : build = gulp.series('server');
        build()
    });

    gulp.watch('./src/**/*.pug', gulp.series('pug')).on('change', browserSync.reload)
    gulp.watch('./src/static/js/*.js', gulp.series('js')).on('change', browserSync.reload)
    
    gulp.watch('./src/static/scss/*.scss', gulp.series('scss', 'purgecss'))
})