var gulp = require('gulp');
//使用gulp-load-plugins模块，可加载package.json文件中所有的gulp模块，同时马上运行它
//var plugins = require('gulp-load-plugins')();

var compass = require('gulp-compass'),
    sass = require('gulp-sass'),
    htmlhint = require('gulp-htmlhint'),
    csslint = require('gulp-csslint'),
    jsHint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    gulpSequence = require('gulp-sequence'),
    browserSync = require('browser-sync').create();
/*
 * html验证：gulp-htmlhint
 * 检查css：gulp-csslint
 * 图片压缩: gulp-imagemin
 * 合并文件：gulp-concat
 * 文件名加MD5后缀：gulp-rev
 * 路径替换：gulp-rev-collector
 * compass编译：gulp-compass
 * js检查：gulp-jshint
 * html压缩：gulp-htmlmin
 * js压缩：gulp-uglify
 * css压缩：gulp-minify-css
 * 删除文件：gulp-clean
 * 错误处理：gulp-plumber
 * */

//检查并压缩html
gulp.task('html', function () {
    var options = {
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    };
    return gulp.src("src/*.html")
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
        .pipe(htmlmin(options))
        .pipe(gulp.dest("dest/"))
        .pipe(browserSync.stream());
});

//压缩图片
gulp.task('img', function () {
    return gulp.src("src/img/*")
        .pipe(imagemin())
        .pipe(gulp.dest("dest/img"))
        .pipe(browserSync.stream()); //将所做修改实时注入浏览器
});

//编译并压缩sass
gulp.task('sass', function () {
    return gulp.src("src/sass/*.scss")
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest("src/css"));
});

//清理css
gulp.task('cleanCss' , ['sass'], function () {
    return gulp.src("dest/css/*.css")
        .pipe(clean());
});

//检查并压缩css
gulp.task('css', ['cleanCss'], function () {
    return gulp.src("src/css/*.css")
        .pipe(csslint())
        .pipe(minifyCss()) //压缩处理成一行
        .pipe(concat('main.min.css')) //合并后的文件名
        .pipe(rev()) //加MD5后缀
        .pipe(gulp.dest("dest/css")) //输出文件
        .pipe(rev.manifest()) //生成一个rev-manifest.json
        .pipe(gulp.dest('rev/css')) //保存上述json文件
        .pipe(browserSync.stream()); //将所做修改实时注入浏览器
});

//替换页面css文件名
gulp.task('revCss', ['css'], function () {
    return gulp.src(["rev/css/rev-manifest.json", "dest/*.html"]) //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector()) //- 执行文件名的替换
        .pipe(gulp.dest("dest/")) //- 替换后的文件输出的目录
        .pipe(browserSync.stream()); //将所做修改实时注入浏览器
});

//清理js
gulp.task('cleanJs', function () {
    return gulp.src("dest/js/*.js")
        .pipe(clean());
});

//检查并压缩js
gulp.task('js', ['cleanJs'],function () {
    return gulp.src("src/js/*.js")
        .pipe(jsHint())
        .pipe(jsHint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(rev()) //加MD5后缀
        .pipe(gulp.dest("dest/js"))
        .pipe(rev.manifest()) //生成一个rev-manifest.json
        .pipe(gulp.dest('rev/js')) //保存上述json文件
        .pipe(browserSync.stream()); //将所做修改实时注入浏览器
});

//替换页面js文件名
gulp.task('revJs', ['js'], function () {
    return gulp.src(["rev/js/rev-manifest.json", "dest/*.html"]) //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector()) //- 执行文件名的替换
        .pipe(gulp.dest("dest/")) //- 替换后的文件输出的目录
        .pipe(browserSync.stream()); //将所做修改实时注入浏览器
});

//实时刷新任务：以dest文件夹为基础，启动服务器
gulp.task('server', function () {
    browserSync.init({
        server: "dest/"  //根目录
    });
});

//监控任务
gulp.task('watch', function () {
    gulp.watch(["src/*.html", "src/sass/*.scss", "src/js/*.js"], ['html', 'revCss', 'revJs'], browserSync.reload);
});

//默认任务：以上
gulp.task('default', gulpSequence('html', 'img', 'revCss', 'revJs', 'server', 'watch', function () {
    console.log("执行完毕！");
}));





