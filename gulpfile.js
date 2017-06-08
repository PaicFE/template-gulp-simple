var path = require('path')
var gulp = require('gulp')
var gulpif = require('gulp-if')
var bs = require('browser-sync')
var less = require('gulp-less')
var cssnano = require('gulp-cssnano')
var postcss = require('gulp-postcss')
var postcssPxtorem = require('postcss-pxtorem')
var posthtml = require('gulp-posthtml')
var posthtmlPx2rem = require('posthtml-px2rem')
var autoprefixer = require('autoprefixer')
var imagemin = require('gulp-imagemin')
var lazyimagecss = require('gulp-lazyimagecss')
var webp = require('gulp-webp')
var RevAll = require('gulp-rev-all')
var revDel = require('gulp-rev-delete-original')
var htmlmin = require('gulp-htmlmin')
var uglify = require('gulp-uglify')
var clean = require('gulp-clean')
var cache = require('gulp-cache')
var replace = require('gulp-replace')
var config = require('./gulpfile.config')



var src = './' + config.src + '/' + config.file
var dist = './' + config.dist + '/' + config.file
var dev = './' + config.dev + '/' + config.file

function getDest() {
    return config.isProd ? dist : dev
}

function buildCss() {
    return gulp.src(src + '/**/*.css')
        .pipe(lazyimagecss())
        .pipe(postcss([
            postcssPxtorem(config.rem),
            autoprefixer(config.autoprefix),
        ]))
        .pipe(gulpif(config.isProd, cssnano()))
        .pipe(gulp.dest(getDest()))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
}

function buildLess() {
    return gulp.src(src + '/**/*.less')
        .pipe(less().on('error', function () { this.emit('end') }))
        .pipe(lazyimagecss())
        .pipe(postcss([
            postcssPxtorem(config.rem),
            autoprefixer(config.autoprefix),
        ]))
        .pipe(gulpif(config.isProd, cssnano()))
        .pipe(gulp.dest(getDest()))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
}

function buildStatic() {
    return gulp.src(src + '/**/*.?(png|jpg|gif)')
        .pipe(imagemin())
        .pipe(gulp.dest(getDest()))
}

function buildWebp() {
    var _dest = getDest()
    return gulp.src(_dest + '/**/*.?(png|jpg|gif)')
        .pipe(webp())
        .pipe(gulp.dest(_dest))
}

function buildHtml() {
    return gulp.src(src + '/**/*.html')
        .pipe(posthtml(posthtmlPx2rem(config.htmlRem)))
        .pipe(gulpif(config.isProd, htmlmin(config.html)))
        .pipe(gulp.dest(getDest()))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
}

function buildScript() {
    return gulp.src(src + '/**/*.js')
        .pipe(gulpif(config.isProd, uglify()))
        .pipe(gulp.dest(getDest()))
        .pipe(gulpif(!config.isProd, bs.reload({ stream: true })))
}

function hash() {
    var _dest = getDest()
    return gulp.src(_dest + '/**/*')
        .pipe(RevAll.revision({
            fileNameManifest: 'manifest.json',
            dontRenameFile: ['.html', '.php'],
            dontUpdateReference: ['.html'],
            transformFilename: function (file, hash) {
                var filename = path.basename(file.path)
                var ext = path.extname(file.path)

                if (/^\d+\..*\.js$/.test(filename)) {
                    return filename
                } else {
                    return path.basename(file.path, ext) + '.' + hash.substr(0, 8) + ext
                }

            }
        }))
        .pipe(gulp.dest(_dest))
        .pipe(revDel({
            exclude: /(.html|.htm)$/
        }))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest(_dest))
}

function develop(cb) {
    config.isProd = false
    cb()
}

function watch(cb) {
    gulp.watch(src + '/**/*.css', buildCss)
    gulp.watch(src + '/**/*.less', buildLess)
    gulp.watch(src + '/**/*.js', buildScript)
    gulp.watch(src + '/**/*.html', buildHtml)
    cb()
}

function server(cb) {
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
    cb()
}


var release = gulp.parallel(buildCss, buildLess, buildStatic, buildHtml, buildScript)

gulp.task('build', gulp.series(release, hash, buildWebp))

gulp.task('default', gulp.series(develop, release, server, watch))

