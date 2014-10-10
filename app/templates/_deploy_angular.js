var Client = require('ftp');
var fs = require('fs');
var pem = require('pem');
var q = require('q');
var merge = require('merge');
var request = require('request');
var ftpConfig = require('./ftp.json');

function Deploy(){
    this.client = new Client();
    this.isConnected = false;
    this.client.on('end',function(){
        this.isConnected = false;
    }.bind(this));
}

Deploy.prototype.connect = function(type){
    var self = this;
    var deferred = q.defer();
    if(!this.isConnected) {
        if(type == 'resource') {
            pem.createCertificate({}, function (e, r) {
                self.client.connect(merge(ftpConfig[type], {
                        secure: true,
                        secureOptions: {
                            key: r.clientKey,
                            cert: r.certificate,
                            requestCert: true,
                            rejectUnauthorized: false
                        }})
                );
            });
        }
        else{
            self.client.connect(ftpConfig[type]);
        }
        this.client.on('ready', function () {
            self.isConnected = true;
            deferred.resolve();
        });
    }
    else{
        deferred.resolve();
    }
    return deferred.promise;
};

Deploy.prototype.uploadResource = function(app,resourceTag){
    var self = this;
    function basePromise(){
        var deferred = q.defer();
        self.client.mkdir(ftpConfig.resource.urlBase+'/'+app,true,function(){
            deferred.resolve();
        });
        return deferred.promise;
    }
    return basePromise().then(function(){
        return q.all(ftpConfig.resource.include.map(function(v,i){
            var deferred = q.defer();
            self.client.mkdir(ftpConfig.resource.urlBase+'/'+app+'/'+v,true,function(){
                fs.readdir('./build/'+v, function (err, files) {
                    if(files.length > 0) {
                        files.map(function (w, i) {
                            fs.statSync('./build/'+v+'/'+w).isFile() && self.client.put('./build/'+v+'/'+w,ftpConfig.resource.urlBase+'/'+app+'/'+v+'/'+w,false,function(e){
                                request.get('http://61.135.251.132:81/upimage/cleanmain.php?url=http://img'+resourceTag+'.cache.netease.com'+ftpConfig.resource.urlBase+'/'+app+'/'+v+'/'+w,function(error, response, body){
                                    deferred.resolve();
                                });
                            });
                        });
                    }
                });
            });
            return deferred.promise;
        }));
    }).then(
        function(){
            self.client.end();
        }
    );
};
Deploy.prototype.uploadPage = function(app,type){
    var self = this;
    function basePromise(){
        var deferred0 = q.defer();
        self.client.mkdir(ftpConfig[type].urlBase+'/'+app+'/views',true,function(e){
            var dirs = ['./build/','./build/views/'].map(function(d,i){
                var deferred1 = q.defer();
                fs.readdir(d, function (err, files) {
                    var htmls = files.filter(function (h, i) {
                        return h.substring(h.length - 5, h.length) == '.html';
                    }).map(function (v, i) {
                        var deferred = q.defer();
                        self.client.put('./build/' + d.substring(8) + v, ftpConfig[type].urlBase + '/' + app + '/' + d.substring(8) + v, false, function (e) {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    });
                    q.all(htmls).then(function () {
                        deferred1.resolve();
                    });
                });
                return deferred1.promise;
            });
            q.all(dirs).then(function(){
                deferred0.resolve();
            });

        });
        return deferred0.promise;
    }
    return basePromise().then(
        function(){
            self.client.end();
        }
    );
};

module.exports = Deploy;
