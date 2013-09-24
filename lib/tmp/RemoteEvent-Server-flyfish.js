/**
 * Created with JetBrains WebStorm.
 * User: aishen
 * Date: 13-9-22
 * Time: 下午8:16
 * To change this template use File | Settings | File Templates.
 */
var zmq = require('zmq');
var envArgv = process.argv.slice(2);


var Server = function(id, host, listenPort, publishPort){
    this.id = id;
    this.host = host;
    this.listenPort = listenPort;
    this.publishPort = publishPort;

    this.publishAddr = ["tcp://", host, ':', publishPort].join('');
    this.listenAddr  = ["tcp://", host, ':', listenPort].join('');
}

Server.prototype.start = function(){
    var self = this;
    this.publishSocket = zmq.socket('pub');
    this.publishSocket.bind(this.publishAddr, function(err){
        if(err){
            throw err;
        }

        console.log('[ ' + self.id + ' ] ' +  'REvent Server start.');
    });

    this.listenSocket = zmq.socket('rep');
    this.listenSocket.bind(this.listenAddr, function(err){
        if(err){
            throw err;
        }

        self.listenSocket.on('message', function(data){
            self.listenSocket.send('');
            console.log('Server on Message: ', data.toString());
            var dataObj = JSON.parse(data.toString());
            self.publishSocket.send(dataObj.event + " " + JSON.stringify(dataObj.param));
        });
    });
}

console.log(envArgv);

if(envArgv.length == 4){
    var id           = envArgv[0],
        host         = envArgv[1],
        listenPort   = envArgv[2],
        publishPort  = envArgv[3];

    var server = new Server(id, host, listenPort, publishPort);

    server.start();
}