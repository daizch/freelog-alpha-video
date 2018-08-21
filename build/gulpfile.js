"use strict";

const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const runSequence = require('run-sequence');
const gulpif = require('gulp-if');
const rename = require("gulp-rename");
const path = require('path')
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');
const chalk = require('chalk')
const logger = require('fancy-log')
const webpack = require('webpack-stream');
const dirname = path.dirname(__filename)
const dest = path.join(dirname, '../dist')
const src = path.join(dirname, '../src')
const pkg = require(path.join(dirname, '../package.json'))
var isBuild = true
var inlineHtml = require('gulp-inline-html');

gulp.task('clean', function () {
  return del([dest], {force: true})
})

function fileType(extname) {
  extname = (extname[0] === '.' ? '' : '.') + extname
  return function (file) {
    return path.extname(file.path) === extname
  }
}

var isHtml = fileType('html')
var isJs = fileType('js')
var isCss = fileType('css')

gulp.task('compile', function () {
  logger.info(chalk.cyan('start compiling...'))

  const htmlFilter = filter(file => /src\/app\/.+\.html$/.test(file.path));
  return gulp.src([`${src}/**/*`])
    .pipe(plumber({
      errorHandler(err) {
        logger.error(`Plumber found unhandled error`)
        console.log(chalk.red(err))
        this.emit('end')
      }
    }))
    .pipe(gulpif(isJs, webpack(require('./webpack.config.js'))))
    .pipe(gulpif(isCss, autoprefixer({browsers: ['> 1%']})))
    .pipe(inlineHtml())
    .pipe(gulpif(isHtml, htmlmin({
      collapseWhitespace: isBuild,
      minifyJS: isBuild,
      minifyCSS: isBuild
    })))
    .pipe(htmlFilter)
    .pipe(gulpif(isHtml, rename({
      basename: pkg.name
    })))
    .pipe(gulp.dest(dest))
    .on('finish', function () {
      !isBuild && logger.info(chalk.green('Compiled successfully'))
    });
});

gulp.task('build', function (done) {
  runSequence('clean',
    ['compile'],
    done)
})

gulp.task('default', ['build'])

gulp.task('watch', function () {
  isBuild = false
  gulp.watch(`${src}/**/*`, ['compile'])
  logger.info(chalk.magenta('start watching...'))
})


module.exports = gulp
