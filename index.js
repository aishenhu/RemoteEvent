/**
 *  ____    _____                          _
 * |  _ \  | ____| __   __   ___   _ __   | |_
 * | |_) | |  _|   \ \ / /  / _ \ | '_ \  | __|
 * |  _ <  | |___   \ V /  |  __/ | | | | | |_
 * |_| \_\ |_____|   \_/    \___| |_| |_|  \__|
 *
 * Based On ZMQ
 *
 * Easy for event notify cross process and host.
 */
var REventServer = require("./lib/REvent-Server"),
    REventClient = require("./lib/REvent-Client"),
    zmq    = require("zmq");

/**
 * 创建一个REvent实例
 * @param sid               REventServer的id，同一台主机上只运行该id的REventServer实例一个
 * @param host              REventServer的地址
 * @param listenPort        REventServer的事件监听端口
 * @param publishPort       REventServer的事件发布端口
 * @constructor
 */
var REvent = function(sid, host, listenPort, publishPort){
    this.sid = sid;
    this.host = host;
    this.listenPort = listenPort;
    this.publishPort = publishPort;

    this._client = new REventClient(host, listenPort, publishPort);
}

REvent.prototype.info = function(){
    return "REvent";
}

/**
 * 添加一个事件监听处理
 * @param event
 * @param callback
 */
REvent.prototype.addObserver = function(event, callback){
    this._client.addObserver(event, callback);
}

/**
 * 移除一个事件处理
 *      如果不指定event的处理函数(callback), 那么则移除所有该事件的处理函数
 * @param event
 * @param callback
 */
REvent.prototype.removeObserver = function(event, callback){
    this._client.removeObserver(event, callback);
}

/**
 * 触发一个事件
 * @param event
 * @param param 事件的参数
 */
REvent.prototype.notifyObservers = function(event, param){
    this._client.notifyObservers(event, param);
}

/**
 * 基于event的RPC调用
 * @param rpcRoute rpc的调用route
 * @param param
 * @param callback rpc调用的回调函数
 *          callback = function(error, data){}
 *          其中：error 表示rpc调用遇到的error
 *               data  表示rpc服务返回的数据， 字符串格式
 */
REvent.prototype.rpc = function(rpcRoute, param, callback){
    this._client.rpc(rpcRoute, param, callback);
}

REvent.prototype.registerRpc = function(rpcRoute, callback){
    this._client.registerRpc(rpcRoute, callback);
}

REvent.prototype.unRegisterRpc = function(rpcRoute, callback){
    this._client.unRegisterRpc(rpcRoute, callback);
}

/**
 * 启动REvent的server实例
 *      在指定的host, port上启动server实例
 *      host目前仅在本机
 * @todo 增强host的范围
 */
REvent.prototype.startServer = function(){
    var host = '0.0.0.0';
    this.server = new REventServer(this.sid, host, this.listenPort, this.publishPort);
    this.server.start(function(){
        console.log(arguments);
    });
}

module.exports = REvent;