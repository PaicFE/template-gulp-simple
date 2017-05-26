var gulp = require('gulp')
var gulpif = require('gulp-if')
var less = require('gulp-less')
var base64 = require('gulp-base64')
var cssnano = require('gulp-cssnano')
var rimraf = require('gulp-rimraf')
var postcss = require('gulp-postcss')
var postcssPxtorem = require('postcss-pxtorem')
var posthtml = require('gulp-posthtml')
var posthtmlPx2rem = require('posthtml-px2rem')
var autoprefixer = require('autoprefixer')
var imagemin = require('gulp-imagemin')
var pngquant = require('imagemin-pngquant')
var rev = require('gulp-rev')
var revCollector = require('gulp-rev-collector')
var bs = require('browser-sync')
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
    processors: [
        postcssPxtorem({
            root_value: '20', // 基准值 html{ font-zise: 20px; }
            prop_white_list: [], // 对所有 px 值生效
            minPixelValue: 2 // 忽略 1px 值
        }),
        autoprefixer({ browsers: ['last 5 versions'] }),
    ],
    htmlRem: posthtmlPx2rem({
        rootValue: 20,
        minPixelValue: 2
    }),
    html: {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true,//压缩HTML
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        minifyJS: true, // 压缩页面JS
        minifyCSS: true, // 压缩页面CSS
    },
    isProd: true
}

var src = './' + config.src + '/' + config.file
var dist = './' + config.dist + '/' + config.file
var dev = './' + config.dev + '/' + config.file
var dest = dist

gulp.task('build:rm', function () {
    gulp.src([dest], { read: false })
        .pipe(rimraf())
})

gulp.task('build:css', function () {
    gulp.src(src + '/**/*.css')
        .pipe(postcss(config.processors))
        .pipe(gulpif(config.isProd, cssnano()))
        .pipe(gulp.dest(dest))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
})

gulp.task('build:less', function () {
    gulp.src(src + '/**/*.less')
        .pipe(less().on('error', function () { this.emit('end') }))
        .pipe(postcss(config.processors))
        .pipe(gulpif(config.isProd, cssnano()))
        .pipe(gulp.dest(dest))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
})

gulp.task('build:static', function () {
    gulp.src(src + '/**/*.?(png|jpg|gif)')
        .pipe(imagemin({use: [pngquant()]}))
        .pipe(gulp.dest(dest))
})

gulp.task('build:html', function () {
    gulp.src(src + '/**/*.html')
        .pipe(posthtml(posthtmlPx2rem({rootValue: 20, minPixelValue: 2})))
        .pipe(gulpif(config.isProd, htmlmin(config.html)))
        .pipe(gulp.dest(dest))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
})

gulp.task('build:script', function () {
    gulp.src(src + '/**/*.js')
        .pipe(gulpif(config.isProd, uglify()))
        .pipe(gulp.dest(dest))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
})

gulp.task('release', ['build:css', 'build:less', 'build:static', 'build:html', 'build:script'])

gulp.task('watch', function () {
    gulp.watch(src + '/**/*.css', ['build:css'])
    gulp.watch(src + '/**/*.less', ['build:less'])
    gulp.watch(src + '/**/*.js', ['build:script'])
    gulp.watch(src + '/**/*.html', ['build:html'])
})

gulp.task('server', function () {
    var port = config.port
    bs.init({
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
    config.isProd = false
    gulp.start('release')
    gulp.start('server')
    gulp.start('watch')
})

