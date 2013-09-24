var REvent = require('../index');

var $E = new REvent('flyfish', '0.0.0.0', 13000, 13001);

$E.startServer();

$E.addObserver('SayHello', function(param){
    console.log('[1]on event SayHello:', param.toString());
});

$E.addObserver('SayHello', function(param){
    console.log('[2]on event SayHello: ', param.toString());
});

setInterval(function(){
    $E.notifyObservers('SayHello', "AISHEN");
}, 100);