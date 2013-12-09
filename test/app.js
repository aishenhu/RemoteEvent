var REvent = require('../index');

var $E = new REvent('zhajinhua-test', '127.0.0.1', 15000, 15001);

$E.startServer();

$E.addObserver('MSGQEVENT', function(param){
    console.log('[1]on event SayHello:', param.toString());
});

$E.addObserver('SayHello', function(param){
    console.log('[2]on event SayHello: ', param.toString());
});

setInterval(function(){
    $E.notifyObservers('SayHello', "AISHEN");
}, 100);
