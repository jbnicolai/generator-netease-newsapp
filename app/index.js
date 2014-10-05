'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var q = require('q');

var NeteaseNewsappGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    //this.destinationRoot(this.destinationRoot()+'/'+this.name);
    //this.appName = this.name;
  },
  prompting: function () {
    var done = this.async();
    this.log(yosay(
      chalk.red('Netease-newsapp generator!')
    ));
    var prompts = require('./prompts'),promptsConfig = require('./promptsConfig'),order = promptsConfig.order;
    var self = this;
        self.promptsResult = {};
    function promise(question,level){
        return function(r){
            var deferred = q.defer();
            if(level != 0 && r != question){
                deferred.resolve(r);
            }
            else{
                self.prompt(prompts[question], function (r){
                    self._.merge(self.promptsResult,r);
                    deferred.resolve(r.scriptType || r.styleType ||{});
                });
            }
            return deferred.promise;
        }
    }
    function promiseArray(a,p,l) {
        return a.reduce(function (p, v, i) {
            return !!promptsConfig[v] && promptsConfig[v].length > 0
                   ? promiseArray(promptsConfig[v],p.then(promise(v,l)),(l+1))
                   : p.then(promise(v,l));
        }, p);
    }
    promiseArray(order,promise(order.shift(),0)(),0).then(function(){
        this.appName = self.promptsResult.appName;
        this.destinationRoot(this.destinationRoot()+'/'+this.appName);
        this.appType = self.promptsResult.scriptType;
        this.appTitle = self.promptsResult.appTitle;
        this.jsBowerDependencies = self.promptsResult.scriptModules.reduce(function(p,v,i){
            p[v.name] = "*";
            return p;
        },{"angular": "*","angular-sanitize": "*"});
        this.jsModules = self.promptsResult.scriptModules.map(function(v,i){
            return v.module;
        });
        this.styleType = self.promptsResult.styleType;
        if(self.promptsResult.styleType != 'normal') {
            this.cssNpmDependencies = ',"gulp-' + self.promptsResult.styleType + '": "*"';
        }
        if(self.promptsResult.styleType == 'sass'){
            this.sassType = self.promptsResult.sassType;
        }
        done();
    }.bind(this));
  },
  configuring: function(){
      this.src.copy('editorconfig', '.editorconfig');
      this.src.copy('jshintrc', '.jshintrc');
  },
  writing: function () {
      this.dest.mkdir('app');
      this.dest.mkdir('app/images');
      this.dest.mkdir('app/scripts');
      this.dest.mkdir('app/styles');
      if(this.styleType == 'sass'){
          this.dest.write('app/styles/main.'+this.sassType,'');
      }
      if(this.styleType == 'less'){
          this.dest.write('app/styles/main.less','');
      }
      this.dest.write('app/styles/main.css','');
      this.dest.mkdir('app/views');
      this.template('_bower.json', 'bower.json',{
          appName : this.appName,
          dependencies : JSON.stringify(this.jsBowerDependencies)
      });
      this.template('_gulpfile.js', 'gulpfile.js',{});
      this.template('_package.json', 'package.json',{
          appName : this.appName,
          dependencies : this.cssNpmDependencies
      });
      this.template('app/_index_'+this.appType+'.html', 'app/index.html', {
          appName : this.appName,
          appTitle : this.appTitle,
          scripts : Object.keys(this.jsBowerDependencies)
      });
      if(this.appType == "angular") {
          this.template('app/scripts/_app.js','app/scripts/app.js',{
              appName : this.appName,
              angularModules : '"'+this.jsModules.join('","')+'"'
          });
          this.template('app/scripts/_controllers.js','app/scripts/controllers.js',{
              appName : this.appName
          });
          this.template('app/scripts/_services.js','app/scripts/services.js',{
              appName : this.appName
          });
          this.template('app/scripts/_values.js','app/scripts/values.js',{
              appName : this.appName
          });
          this.template('app/scripts/_directives.js','app/scripts/directives.js',{
              appName : this.appName
          });

      }
  },
  install : function(){
      this.installDependencies({
          bower: true,
          npm: true,
          skipInstall: false,
          callback: function () {
              console.log(chalk.green('\rEverything is ready!'));
          }
      });
  },
  end: function () {

  }
});

module.exports = NeteaseNewsappGenerator;
