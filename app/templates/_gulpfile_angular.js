var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var ip = require('ip');
var open = require('open');
var config = require('./package.json');
var ftpConfig = require('./ftp.json');
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
    .pipe(gulp.dest('build/styles'))
    .pipe($.size({title:'online.css'}));
});
gulp.task('script', function () {
  return gulp.src('app/scripts/*.js')
    .pipe($.concat('online.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('build/scripts'))
    .pipe($.size({title:'online.js'}));
});
gulp.task('html', function () {
  var assets = $.useref.assets();
  var ipAddress = ip.address();
  resourceTag = Math.floor(Math.random()*6)+1;
  gulp.src('app/scripts/values.js')
    .pipe($.replace('../images','http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/images'))
    .pipe($.replace(ipAddress,'img'+resourceTag+'.cache.netease.com/utf8/'+config.name))
    .pipe($.replace('./','http://c.3g.163.com/nc/qa/'+config.name+'/'))
    .pipe($.replace('t.c.m.163.com/qa/'+config.name+'/','c.3g.163.com/nc/qa/'+config.name+'/'))
    .pipe($.replace('t.c.m.163.com','c.3g.163.com'))
    .pipe(gulp.dest('app/scripts/'));



  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('build'))
    .pipe($.replace('../images','http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/images'))
    .pipe($.replace(ipAddress,'img'+resourceTag+'.cache.netease.com/utf8/'+config.name))
    .pipe(gulp.dest('build'));
});
gulp.task('local',function(){
  var ipAddress = ip.address();
  var regexp = new RegExp("img[1-6].cache.netease.com/utf8/"+config.name,'g');
  gulp.src('app/*.html')
    .pipe(gulp.dest('test/'))
    .pipe($.replace('src="bower_components','src="http://'+ipAddress+'/bower_components'))
    .pipe($.replace('src="scripts','src="http://'+ipAddress+'/scripts'))
    .pipe($.replace('href="styles','href="http://'+ipAddress+'/styles'))
    .pipe($.replace('./images','http://'+ipAddress+'/images'))
    .pipe(gulp.dest('test/'));
  gulp.src('app/scripts/values.js')
    .pipe($.replace('../images','http://'+ipAddress+'/images'))
    .pipe($.replace('./','http://t.c.m.163.com/qa/'+config.name+'/'))
    .pipe($.replace('c.3g.163.com/nc/qa/'+config.name+'/','t.c.m.163.com/qa/'+config.name+'/'))
    .pipe($.replace('c.3g.163.com/uc','t.c.m.163.com/uc'))
    .pipe($.replace(regexp,ipAddress))
    .pipe(gulp.dest('app/scripts/'));
  gulp.src('app/views/*.html')
    .pipe(gulp.dest('test/views/'))
    .pipe($.replace('../images','http://'+ipAddress+'/images'))
    .pipe(gulp.dest('test/views/'))
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
    'app/views/*.html',
    'app/*.html'
  ], function(event) {
    return gulp.src(event.path)
      .pipe(browserSync.reload({stream:true}));
  });
  gulp.watch(['app/styles/*.scss','app/styles/*.sass'],['sass']);
});
gulp.task('server', ['browser-sync','watch'], function () {

});
gulp.task('build',['html'],function(){
  var ipAddress = ip.address();
  resourceTag = Math.floor(Math.random()*6)+1;
  gulp.src('app/views/*.html')
    .pipe(gulp.dest('build/views'))
    .pipe($.replace('../images','http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/images'))
    .pipe($.replace(ipAddress,'img'+resourceTag+'.cache.netease.com/utf8/'+config.name))
    .pipe(gulp.dest('build/views'));

  gulp.src('build/index.html')
    .pipe($.replace('../build/scripts/lib.js', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/scripts/lib.js?v='+new Date().getTime()))
    .pipe($.replace('../build/scripts/online.js', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/scripts/online.js?v='+new Date().getTime()))
    .pipe($.replace('../build/styles/online.css', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/styles/online.css?v='+new Date().getTime()))
    .pipe($.replace('./images', 'http://img'+resourceTag+'.cache.netease.com/utf8/'+config.name+'/images'))
    .pipe($.replace('t.c.m.163.com/qa/'+config.name+'/','c.3g.163.com/nc/qa/'+config.name+'/'))
    .pipe($.replace('t.c.m.163.com','c.3g.163.com'))
    .pipe(gulp.dest('build'));
});
gulp.task('deploy:resource',['build'],function(){
  resourceTag = Math.floor(Math.random()*6)+1;
  var deploy_resource = new Deploy();
  deploy_resource.connect('resource')
    .then(function(){
      return deploy_resource.uploadResource(config.name,resourceTag);
    });
});
gulp.task('deploy:image',function(){
  resourceTag = Math.floor(Math.random()*6)+1;
  var deploy_images = new Deploy();
  deploy_images.connect('image')
    .then(function(){
      return deploy_images.uploadImage(config.name,resourceTag);
    })
});
gulp.task('deploy:test',['local'],function(){
  var deploy_page = new Deploy();
  deploy_page.connect('test')
    .then(function(){
      return deploy_page.uploadPage(config.name,'test');
    })
    .then(function(){
      open(ftpConfig['test'].locationBase+config.name+'/index.html','google chrome');
    })
    .then(function(){

    });
});
gulp.task('deploy:online',['build'],function(){
  var deploy_page = new Deploy();
  deploy_page.connect('online')
    .then(function(){
      return deploy_page.uploadPage(config.name,'online');
    })
    .then(function(){
      open(ftpConfig['online'].locationBase+config.name+'/index.html','google chrome');
    })
    .then(function(){

    });
});
