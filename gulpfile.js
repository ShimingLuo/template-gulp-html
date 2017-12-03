/**
 * author: GavinLuo
 * site: https://gavinluo.cn/
 * date: 2017/12/1 15:45
 */
'use strict';
let gulp = require('gulp'),
    connect = require('gulp-connect'),
    proxy = require('http-proxy-middleware');

const del = require('del');
const config = require('config-lite')(__dirname);

const BUILD_ROOT_PATH = `${__dirname}/${config.buildPath}`;
const DEAL_PATH = `${__dirname}/src`;

// gulp-server 配置
gulp.task('connect', () => {
    connect.server({
        name: 'APP',
        root: ['./'],
        port: config.livePort,
        livereload: true,
        middleware: (connect, opt) => {
            let middle = [];
            // 解析代理，中间健
            config.proxyList.forEach(function (item) {
                let pathRewrite = {};
                pathRewrite[`^${item.routerPath}`] = "";
                //
                middle.push(proxy(item.routerPath, {
                    target: item.targetURL,
                    changeOrigin: true,
                    pathRewrite: pathRewrite
                }));
            });
            return middle;
        }
    });
});

/* 资源文件处理 */
let htmlmin = require('gulp-htmlmin');
let minifyCSS = require('gulp-minify-css');
let uglify = require('gulp-uglify');
// 清除已有 build/ 文件夹
gulp.task('clean', () => {
    return del([BUILD_ROOT_PATH]);
});
// 处理 *.html
gulp.task('html', () => {
    return gulp.src(`${DEAL_PATH}/*.html`).pipe(htmlmin({
        collapseWhitespace: false,
        removeComments: true
    })).pipe(gulp.dest(`${BUILD_ROOT_PATH}`));
});
// 处理 *.css
gulp.task('css', () => {
    return gulp.src([`${DEAL_PATH}/css/*.css`]).pipe(minifyCSS()).pipe(gulp.dest(`${BUILD_ROOT_PATH}/css`));
});
// 处理 *.js
gulp.task('js', () => {
    return gulp.src([`${DEAL_PATH}/js/*.js`]).pipe(uglify({
        mangle: true,//类型：Boolean 默认：true 是否修改变量名
        compress: true,//类型：Boolean 默认：true 是否完全压缩
    })).pipe(gulp.dest(`${BUILD_ROOT_PATH}/js`));
});
// 移动资源
gulp.task('static', () => {
    return gulp.src([`${DEAL_PATH}/lib/**`]).pipe(gulp.dest(`${BUILD_ROOT_PATH}/lib`));
});

// 文件构建
gulp.task('build', ['clean'], () => {
    gulp.start('static', 'html', 'css', 'js');
});

// watch
gulp.task('watch', () => {
    gulp.watch([`${DEAL_PATH}/**`]).on('change', (event) => {
        console.log(`【${new Date().toLocaleTimeString()}】 ${event.path} - ${event.type}`);
        gulp.src([`${DEAL_PATH}/**`]).pipe(connect.reload());
    });
});
// live-reload 实时刷新服务
gulp.task('dev-livereload', ['connect', 'watch']);
// build/ 文件夹监听自动刷新
gulp.task('build-livereload', ['connect', 'watch']);

// 文件夹，打包压缩文件
gulp.task('build-zip', ['build'], () => {
    let zip = require('gulp-zip');
    return gulp.src(`${BUILD_ROOT_PATH}/**`)
        .pipe(zip(config.buildZipName))
        .pipe(gulp.dest(config.buildZipPath))
        .on('end', () => {
            del.sync(BUILD_ROOT_PATH);
        });
});

/* 远程服务器操作 */
const GulpSSH = require('gulp-ssh');
let gulpSSH = new GulpSSH(config.SSH);

// 上传文件到远程
gulp.task('upload-dir', ['build'], () => {
    return gulp.src([`${BUILD_ROOT_PATH}/**`])
        .pipe(gulpSSH.dest(config.uploadSSHBuildPath))
        .on('end', () => {
            del.sync(BUILD_ROOT_PATH);
        });
});

// 远程服务器执行 sell 命令
gulp.task('shell', ['build'], () => {
    return gulpSSH.shell(config.shellCommand).pipe(logStream());
});

/* gulp 插件 */
/**
 * 打印 Stream 流数据为字符串
 * @param options
 * @returns {*}
 */
function logStream(options){
    // 模仿 Gulp 插件写法
    // 入门级写法： http://www.cnblogs.com/chyingp/p/writting-gulp-plugin.html
    let through = require('through2');// Node Stream的简单封装，目的是让链式流操作更加简单
    return through.obj(function (file, enc, cb) {
        console.log(file.contents.toString());
        // 据说是 through2 标配
        // 似乎需要push一下，不然后续的pipe不会处理这个文件？
        this.push(file);
        return cb();
    });
}



/* 帮助任务 */
gulp.task('help',function () {
    console.log('	gulp build			文件打包');
    console.log('	gulp help			帮助');
});
/* 默认任务 */
gulp.task('default',function () {
    gulp.start('help');
});

