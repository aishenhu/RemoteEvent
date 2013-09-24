/**
 * Created with JetBrains WebStorm.
 * User: aishen
 * Date: 13-9-22
 * Time: 下午7:58
 * To change this template use File | Settings | File Templates.
 */
var exec = require('child_process').exec;

/**
 * ServerId for REventServer
 * @param sid
 * @param host
 * @param listenPort
 * @param publishPort
 * @constructor
 */
var REventServer = function(sid, host, listenPort, publishPort){
    this.id = sid;
    this.host = host;
    this.listenPort = listenPort;
    this.publishPort = publishPort;
}

/**
 * 启动RemoteEvent的server进程，同一个id的REventServer共享一个进程
 *
 * 通过server.sh脚本根据id创建服务器运行代码，并且运行
 */
REventServer.prototype.start = function(callback){
    var sbin = __dirname + "/server.sh";
    var self = this;
    //console.log(sbin);
    var server = exec(["/bin/bash", sbin, "_server_template.js", this.id, this.host,
        this.listenPort, this.publishPort, '>> server.log'].join(' '), function(err, stdout, stderr){
            console.log(err, stdout, err);
            if(!err && !stderr){
                callback(self);
            }else{
                callback(null, err, stderr);
            }
    });
}

module.exports = REventServer;
