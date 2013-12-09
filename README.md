基于ZMQ的事件以及RPC调用
=====
         ____    _____                          _
        |  _ \  | ____| __   __   ___   _ __   | |_
        | |_) | |  _|   \ \ / /  / _ \ | '_ \  | __|
        |  _ <  | |___   \ V /  |  __/ | | | | | |_
        |_| \_\ |_____|   \_/    \___| |_| |_|  \__|
 
        Based On ZMQ
 
        Easy for event notify cross process and host.
===============================================================================================================


 ## 如何使用REvent进行事件监听
```js
 var REvent = require('remote_event');
 //在本机创建REvent对象，标识为flyfish-test, 使用端口15000和150001 
 var $E = new REvent('flyfish-test', '127.0.0.1', 15000, 15001);
 //启动REvent的服务器
 $E.startServer(); 
 //监听事件 "SayHello"
 $E.addObserver('SayHello', function(param){
    console.log('[2]on event SayHello: ', param.toString());
 });
 setInterval(function(){
  	  //触发事件 "SayHello"
      $E.notifyObservers('SayHello', "AISHEN");
  }, 100);
```

## 如何使用REvent进行rpc调用
```js
  var REvent = require('remote_event');
  //在本机创建REvent对象，标识为flyfish-rpc, 使用端口14000和140001 
  var $E = new REvent('flyfish-rpc', '127.0.0.1', 14000, 14001);
  //启动REvent服务器
  $E.startServer();
  //注册一个RPC调用
  $E.registerRpc("flyfish.user.rpc.test", function(rpcParam, callback){
      var msg = '[' + (new Date()) + '] reply: ' + "flyfish.user.rpc.test, " +   JSON.stringify(rpcParam);
      callback(msg);
  });
  setInterval(function(){
       /*      rpc调用格式： function(rpcRoute, param, callback)  
        *          callback = function(error, data){}
        *          其中：error 表示rpc调用遇到的error
        *               data  表示rpc服务返回的数据， 字符串格式
        */
      $E.rpc('flyfish.user.rpc.test', {name: "REvent"}, function(err, data){
          if(err){
              console.log('rpc call error: ', err);
          }else{
              console.log("rpc call get : ",data);
          }
      })
  }, 500);
 ```

- 详细实例在test中 

ZMQ
===
>安装ZMQ运行库 http://zeromq.org/intro:get-the-software 下载[例如版本3.2.3]
```./configure
    make && make install
```



