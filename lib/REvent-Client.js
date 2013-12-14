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
var RPC_TIMEOUT_DEFAULT = 5000;

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
    this.rpcMap = {};
    this.rpcCount = 0;
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
    if(observers && ( observers.length = 0 )){
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

/**
 * client 进行一次rpc调用
 *  rpcRoute rpc的调用route
 *  param
 *  callback rpc调用的回调函数
 */
REventClient.prototype.rpc = function(){
    var argLength = arguments.length;
    if(argLength < 1){
        return;
    }

    var rpcRoute = arguments[0];
    var callback = argLength > 1 ? arguments[ argLength - 1 ]: function(){}

    var paramList = [];

    for(var i = 1; i < argLength - 1; i ++){
        paramList.push(arguments[i]);
    }

    var id = this.rpcCount ++;
    var self = this;
    var rpcItem = {
        id        : id,
        callback  : callback,
        timeout   : setTimeout(function(){
            callback(new Error('rpc call '+ id + ' timeout'));
            self._resetRpc(id);
        }, RPC_TIMEOUT_DEFAULT),
        rpcCallbckRoute : this._getRouteById(id)
    }

    this.rpcMap[id] = rpcItem;
    paramList.push(id);

    this.addObserver(rpcItem.rpcCallbckRoute, function(data){
        callback && callback(null, data);
        self._resetRpc(id);
    });

    this.notifyObservers(rpcRoute, paramList);
}

REventClient.prototype._resetRpc = function(id){
    var ipcItem = this.rpcMap[id];
    if(ipcItem){
        clearTimeout(ipcItem.timeout);
        this.removeObserver(ipcItem.rpcCallbckRoute, null);
        ipcItem = null;
        delete this.rpcMap[id];
    }
}

REventClient.prototype._getRouteById = function(id){
    return [id, "rpcRoute", "callback"].join('-');
}

/**
 * 注册rpc服务
 * @param rpcRoute rpc调用时的route
 * @param handler  rpc的处理函数
 *          handler = function(rpcParam, callback){}
 *          handler接受两个参数： rpcParam表示调用参数，
 *                             rpc服务的处理结果传递给callback
 */
REventClient.prototype.registerRpc = function(rpcRoute, handler){
    var self = this;
    /**
     * rpcParam { event: '', param: '' }
     */
    this.addObserver(rpcRoute, function(rpcParam){
        rpcParam = typeof rpcParam == "string" ? JSON.parse(rpcParam) : rpcParam;
        var id = rpcParam.pop();
        var callback = function(id, data){
            var route = self._getRouteById(id);
            self.notifyObservers(route, data);
        }
        callback = callback.bind(null, id);
        handler.apply(null, rpcParam.concat(callback));
    });
}

REventClient.prototype.unRegisterRpc = function(rpcRoute, callback){
    this.removeObserver(rpcRoute, callback);
}

module.exports = REventClient;
