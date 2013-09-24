/**
 * Created with JetBrains WebStorm.
 * User: aishen
 * Date: 13-9-22
 * Time: 下午7:58
 * To change this template use File | Settings | File Templates.
 *
 * Client For REvent
 */
var zmq = require('zmq');

/**
 *
 * @param host                 REventServer所处host地址
 * @param listenPort           REventServer监听client请求的端口
 * @param publishPort          REventServer发布事件通知的端口
 * @constructor
 */
var REventClient = function(host, listenPort, publishPort){
    this.host = host;
    this.listenPort = listenPort;
    this.publishPort = publishPort;
    this.listenRemote = [ "tcp://", this.host, ':', this.listenPort ].join('');
    this.publishRemote = [ "tcp://", this.host, ':', this.publishPort ].join('');
    this._init_();
}

REventClient.prototype._init_ = function(){
    this.notifySocket = zmq.socket('req');
    this.observerSocket = zmq.socket('sub');

    this.notifySocket.connect(this.listenRemote);
    this.observerSocket.connect(this.publishRemote);

    var self = this;
    this.observerSocket.on('message', function(data){
        var dataStr = data.toString().replace(/^ */, '');
        var index = dataStr.indexOf(' ');
        var event = dataStr.slice(0, index);
        var param = dataStr.slice(index + 1);

        self.onEvent(event, param);
    });

    this.eventMap = {};
}

/**
 * 添加一个事件监听
 * @param event           事件名称
 * @param callback        事件回调函数
 */
REventClient.prototype.addObserver = function(event, callback){
    var socket = this.observerSocket;

    var observers = this.eventMap[event];
    if(observers && observers.length > 0){
        if( callback in observers ){
            ;
        }else{
            observers.push(callback);
        }
    }else{
        socket.subscribe(event);
        this.eventMap[event] = new Array();
        this.eventMap[event].push(callback);
    }
}

/**
 * 移除一个事件的监听函数
 * 如果事件的监听函数列表为空，则移除socket的监听
 * @param event
 * @param callback
 */
REventClient.prototype.removeObserver = function(event, callback){
    if(!callback){
        this.eventMap[event] && (this.eventMap[event].length = 0);
        this.observerSocket.unsubscribe(event);
        return;
    }

    var socket = this.observerSocket;
    var observers = this.eventMap[event];

    //移除监听函数
    if(observers && observers.length > 0){
        for(var i = 0, len = observers.length; i < len; i ++){
            if(observers[i] == callback){
                observers.splice(i, 1);
                break;
            }
        }
    }

    //如果监听函数列表为空，则移除socket的监听
    if(observers || ( observers.length = 0 )){
        socket.unsubscribe(event);
    }
}

/**
 * 接收到REventServer的事件推送
 * @param event
 * @param param
 */
REventClient.prototype.onEvent = function(event, param){
    //console.log('onEvent:', event, param);
    //console.log(this.eventMap);
    var observers = this.eventMap[event];
    if(observers && observers.length > 0){
        for(var i = 0, len = observers.length; i < len; i ++){
            var observer = observers[i];
            observer(param);
        }
    }
}

/**
 * client对server的事件通知
 * @param event
 * @param param
 */
REventClient.prototype.notifyObservers = function(event, param){
    var socket = this.notifySocket;
    socket.send(JSON.stringify({
        event: event,
        param: param
    }));
}

module.exports = REventClient;
