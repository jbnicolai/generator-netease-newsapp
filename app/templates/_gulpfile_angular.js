var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var config = require('./package.json');
gulp.task('sass', function () {
    return gulp.src(['app/styles/*.scss','app/styles/*.sass'])
        .pipe($.sass({style: 'expanded'}))
        .on('error', function(err){
            console.error(err.toString());
            this.emit('end');
        })
        .pipe($.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('app/styles'))
        .pipe(browserSync.reload({stream:true}));
});
gulp.task('style', function () {
    return gulp.src('app/styles/*.css')
        .pipe($.concat('online.css'))
        .pipe($.csso())
        .pipe(gulp.dest('build'))
        .pipe($.size({title:'online.css'}));
});
gulp.task('script', function () {
    return gulp.src('app/scripts/*.js')
        .pipe($.concat('online.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('build'))
        .pipe($.size({title:'online.js'}));
});
gulp.task('html', function () {
    var assets = $.useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest('build'));
});
gulp.task('browser-sync', function () {
    return gulp.task('browser-sync', function() {
        browserSync({
            server: {
                baseDir: "./app",
                index: "index.html"
            },
            browser: 'google chrome',
            open: "external",
            port: 80,
            ghostMode: {
                clicks: true,
                location: true,
                forms: true,
                scroll: true
            }
        });
    });
});
gulp.task('watch',function(){
    gulp.watch([
        'app/styles/*.css',
        'app/scripts/*.js',
        'app/views/*.html'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(browserSync.reload({stream:true}));
    });
    gulp.watch(['app/styles/*.scss','app/styles/*.sass'],['sass']);
});
gulp.task('server', ['browser-sync','watch'], function () {

});
gulp.task('build',['html'],function(){
    gulp.src('app/views/*.html')
        .pipe(gulp.dest('build/views'));
    gulp.src(['build/index.html'])
        .pipe($.replace('../build/script/lib.js', 'http://img'+(Math.floor(Math.random()*6)+1)+'.cache.netease.com/utf8/'+config.name+'/script/lib.js?v='+new Date().getTime()))
        .pipe($.replace('../build/script/online.js', 'http://img'+(Math.floor(Math.random()*6)+1)+'.cache.netease.com/utf8/'+config.name+'/script/online.js?v='+new Date().getTime()))
        .pipe($.replace('../build/style/online.css', 'http://img'+(Math.floor(Math.random()*6)+1)+'.cache.netease.com/utf8/'+config.name+'/style/online.css?v='+new Date().getTime()))
        .pipe(gulp.dest('build/'))
});