var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var config = require('./package.json');
var Deploy = require('./deploy');

var resourceTag = 1;

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
    resourceTag = Math.floor(Math.random()*6)+1;
    gulp.src('app/views/*.html')
        .pipe(gulp.dest('build/views'));
    gulp.src(['build/index.html'])
        .pipe($.replace('../build/scripts/lib.js', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/scripts/lib.js?v='+new Date().getTime()))
        .pipe($.replace('../build/scripts/online.js', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/scripts/online.js?v='+new Date().getTime()))
        .pipe($.replace('../build/styles/online.css', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/styles/online.css?v='+new Date().getTime()))
        .pipe(gulp.dest('build/'))
});

gulp.task('deploy_resource',['build'],function(){
    var deploy_resource = new Deploy();
    deploy_resource.connect('resource')
        .then(function(){
            return deploy_resource.uploadResource(config.name,resourceTag);
        });
});
gulp.task('deploy_pageTest',['build'],function(){
    var deploy_page = new Deploy();
    deploy_page.connect('pageTest')
        .then(function(){
            return deploy_page.uploadPage(config.name,'pageTest');
        });
});
gulp.task('deploy_pageOnline',['build'],function(){
    var deploy_page = new Deploy();
    deploy_page.connect('pageOnline')
        .then(function(){
            return deploy_page.uploadPage(config.name,'pageOnline');
        });
});
