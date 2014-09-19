'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var q = require('q');

var NeteaseNewsappGenerator = yeoman.generators.NamedBase.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.destinationRoot(this.destinationRoot()+'/'+this.name);
    this.appName = this.name;
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
                    deferred.resolve(r.scriptType || {});
                });
            }
            return deferred.promise;
        }
    }
    function promiseArray(a,p,l) {
        return a.reduce(function (p, v, i) {
            return !!promptsConfig[v]
                   ? promiseArray(Object.keys(promptsConfig[v]),p.then(promise(v,l)),(l+1))
                   : p.then(promise(v,l));
        }, p);
    }
    promiseArray(order,promise(order.shift(),0)(),0).then(function(){
        this.appType = self.promptsResult.scriptType;
        this.appTitle = self.promptsResult.appTitle;
        this.jsBowerDependencies = self.promptsResult.scriptModules.reduce(function(p,v,i){
            p[v.name] = "*";
            return p;
        },promptsConfig["script"][self.promptsResult.scriptType].default.name || {});
        this.jsModules = self.promptsResult.scriptModules.map(function(v,i){
            return v.module;
        }).concat(promptsConfig["script"][self.promptsResult.scriptType].default.module);
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
      this.dest.mkdir('app/views');
      this.src.copy('_package.json', 'package.json');
      this.template('_bower.json', 'bower.json',{
          appName : this.appName,
          dependencies : JSON.stringify(this.jsBowerDependencies)
      });
      this.template('app/_index_'+this.appType+'.html', 'app/index.html', {
          appName : this.appName,
          appTitle : this.appTitle,
          scripts : Object.keys(this.jsBowerDependencies)
      });
      if(this.appType = "angular") {
          this.template('app/scripts/_app.js','app/scripts/app.js',{
              appName : this.appName,
              angularModules : JSON.stringify(this.jsModules),
              useRoute : true
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
