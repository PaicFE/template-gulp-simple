/**
 * Created by xiehui493 on 2016/12/9.
 */
var gulp = require('gulp');
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var px2rem = require('postcss-px2rem');// px转rem插件
var base64 = require('gulp-base64');  // base64转码
var minify = require('gulp-minify-css');// css压缩
var rimraf = require('gulp-rimraf'); // 删除文件

var rev = require('gulp-rev');                           // 添加版本号
var revCollector = require('gulp-rev-collector');        // 添加版本号
var browserSync = require('browser-sync');
var clean = require('gulp-clean');                       // 清理文目标文件夹
var cache = require('gulp-cache');                       // 缓存处理
var htmlmin = require('gulp-htmlmin');                    // 压缩html
var replace = require('gulp-replace');                     // 替换路径
var uglify = require('gulp-uglify');

var config = {
    src: 'src',
    dest: 'dist',
    file: 'hello',
    port: 3000,
};

var src = './' + config.src + '/' + config.file
var dest = './' + config.dest + '/' + config.file

gulp.task('build:rm', function () {
    gulp.src([dest], { read: false })
        .pipe(rimraf())
});

gulp.task('build:css', function () {
    gulp.src(src + '/**/*.css')
        // .pipe(rev({merge:true}))
        // .pipe(rev())
        .pipe(minify())
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('build:less', function () {
    var processors = [px2rem({ remUnit: 10 })];
    gulp.src(src + '**/*.less')
        .pipe(less().on('error', function (e) {
            console.error(e.message);
            this.emit('end');
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('build:style', ['build:css', 'build:less'])

gulp.task('build:static', function () {
    gulp.src(src + '/**/*.?(png|jpg|gif)')
        .pipe(gulp.dest(dest))
})

gulp.task('build:html', function () {
    var options = {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true,//压缩HTML
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        minifyJS: true, // 压缩页面JS
        minifyCSS: true, // 压缩页面CSS
    };
    gulp.src(src + '/**/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('build:script', function () {
    gulp.src(src + '/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('release', ['build:style', 'build:static', 'build:html', 'build:script'])

gulp.task('watch', function () {
    gulp.watch(src + '**/*.less', ['build:less']);
    gulp.watch(src + '**/*.css', ['build:css']);
    gulp.watch(src + '**/*.js', ['build:script']);
    gulp.watch(src + '**/*.html', ['build:html']);
})

gulp.task('server', function () {
    var port = config.port
    browserSync.init({
        server: {
            baseDir: "./" + config.dest
        },
        ui: {
            port: port + 1,
            weinre: {
                port: port + 2
            }
        },
        port: port,
        startPath: '/'+ config.file
    });
})

gulp.task('default', ['release'], function () {
    gulp.start('server')
    gulp.start('watch')
})






