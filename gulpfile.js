var gulp = require('gulp')
var less = require('gulp-less')
var postcss = require('gulp-postcss')
var px2rem = require('postcss-px2rem')
var base64 = require('gulp-base64')
var minify = require('gulp-minify-css')
var rimraf = require('gulp-rimraf')

var rev = require('gulp-rev')
var revCollector = require('gulp-rev-collector')
var browserSync = require('browser-sync')
var clean = require('gulp-clean')
var cache = require('gulp-cache')
var htmlmin = require('gulp-htmlmin')
var replace = require('gulp-replace')
var uglify = require('gulp-uglify')

var config = {
    src: 'src',
    dist: 'dist',
    dev: 'dev',
    file: 'hello',
    port: 3000,
}

var src = './' + config.src + '/' + config.file
var dist = './' + config.dist + '/' + config.file
var dev = './' + config.dev + '/' + config.file
var dest = dist

gulp.task('build:rm', function () {
    gulp.src([dest], { read: false })
        .pipe(rimraf())
})


gulp.task('dev:css', function(){
      gulp.src(src + '/**/*.css')
        .pipe(gulp.dest(dev))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('build:css', function () {
    gulp.src(src + '/**/*.css')
        .pipe(minify())
        .pipe(gulp.dest(dist))
})


gulp.task('dev:less', function () {
    var processors = [px2rem({ remUnit: 10 })]
    gulp.src(src + '**/*.less')
        .pipe(less().on('error', function (e) {
            console.error(e.message)
            this.emit('end')
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(dist))
})

gulp.task('build:less', function () {
    var processors = [px2rem({ remUnit: 10 })]
    gulp.src(src + '**/*.less')
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(gulp.dest(dev))
        .pipe(browserSync.reload({ stream: true }))
})


gulp.task('dev:style', ['dev:css', 'dev:less'])
gulp.task('build:style', ['build:css', 'build:less'])

gulp.task('build:static', function () {
    gulp.src(src + '/**/*.?(png|jpg|gif)')
        .pipe(gulp.dest(dest))
})


gulp.task('dev:html', function(){
     gulp.src(src + '/**/*.html')
        .pipe(gulp.dest(dev))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('build:html', function () {
    var options = {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true,//压缩HTML
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        minifyJS: true, // 压缩页面JS
        minifyCSS: true, // 压缩页面CSS
    }
    gulp.src(src + '/**/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest(dist))
})


gulp.task('dev:script', function () {
    gulp.src(src + '/**/*.js')
        .pipe(gulp.dest(dev))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('build:script', function () {
    gulp.src(src + '/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(dist))
})


gulp.task('release', ['build:style', 'build:static', 'build:html', 'build:script'])
gulp.task('prerender', ['dev:style', 'build:static', 'dev:html', 'dev:script'])

gulp.task('watch', function () {
    gulp.watch(src + '**/*.less', ['dev:less'])
    gulp.watch(src + '**/*.css', ['dev:css'])
    gulp.watch(src + '**/*.js', ['dev:script'])
    gulp.watch(src + '**/*.html', ['dev:html'])
})

gulp.task('server', function () {
    var port = config.port
    browserSync.init({
        server: {
            baseDir: config.dev
        },
        ui: {
            port: port + 1,
            weinre: {
                port: port + 2
            }
        },
        port: port,
        startPath: '/' + config.file
    })
})

gulp.task('default', function () {
    dest = dev
    gulp.start('prerender')
    gulp.start('server')
    gulp.start('watch')
})

