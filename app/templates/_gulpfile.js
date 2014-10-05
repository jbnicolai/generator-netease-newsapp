var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
gulp.task('styles', function () {
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
gulp.task('browser-sync', function () {
    gulp.task('browser-sync', function() {
        browserSync({
            server: {
                baseDir: "./app",
                index: "index.html"
            },
            browser: 'google chrome',
            open: "external"
        });
    });
});
gulp.task('watch',function(){
    gulp.watch([
        'app/styles/*.scss',
        'app/scripts/*.js',
        'app/views/*.html'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(browserSync.reload({stream:true}));
    });
    gulp.watch(['app/styles/*.scss'],['styles']);
});
gulp.task('server', ['browser-sync','watch'], function () {

});