var Client = require('ftp');
var fs = require('fs');
var pem = require('pem');
var q = require('q');
var merge = require('merge');
var ftpConfig = require('./ftp.json');

function Deploy(){
  this.client = new Client();
  this.isConnected = false;
  this.client.on('close',function(){
      this.isConnected = false;
  }.bind(this));
}

Deploy.prototype.connect = function(type){
    var self = this;
    var deferred = q.defer();
    if(!this.isConnected) {
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

Deploy.prototype.uploadResource = function(app){
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
                                deferred.resolve();
                            });
                        });
                    }
                });
            });
            return deferred.promise;
        }));
    });
};

module.exports = Deploy;
