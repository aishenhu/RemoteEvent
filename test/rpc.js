var REvent = require('../index');

var $E = new REvent('flyfish-rpc', '127.0.0.1', 14000, 14001);

$E.startServer();

$E.registerRpc("flyfish.user.rpc.test", function(rpcParam, callback){
    var msg = '[' + (new Date()) + '] reply: ' + "flyfish.user.rpc.test, " + JSON.stringify(rpcParam);
    callback(msg);
});

setInterval(function(){
    $E.rpc('flyfish.user.rpc.test', {name: "REvent"}, function(err, data){
        if(err){
            console.log('rpc call error: ', err);
        }else{
            console.log("rpc call get : ",data);
        }
    })
}, 500);
