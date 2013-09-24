#!/bin/bash
# @auther aishen
# Run server script {$1, $2}
# $1 server template file name
# $2 server id

# 输出信息到stderr
function echoerr(){
    echo "$@" 1>&2;
}

# 获取当前执行脚本的绝对目录
function getShellRoot(){
    local oldPwd=$(pwd);
    local shellRoot=$(cd "$( dirname "$0" )"; pwd);
    cd $oldPwd;           # 恢复工作目录
    echo $shellRoot;  # Return the path without echo to output device.
}

# 检查server脚本进程是否正在运行
function check(){
    local path=$1;
    local res=$(ps aux | grep -v grep | grep node | grep $path | awk '{print $2}')
    [ -z $res ] && { res=-1; }
    echo $res;
}

SHELLROOT=$(getShellRoot);      #脚本执行目录
if [ $# -eq 0 ]; then
    echoerr "need param server script.";
    exit 1;
fi

APP=${SHELLROOT}/$1;
TEMPDIR=${SHELLROOT}/tmp;
ID=$2
Host=$3
ListenPort=$4
PublishPort=$5

if [ -d $TEMPDIR ]; then
    [ ]
else
    mkdir -p $TEMPDIR
fi

SERVER=${TEMPDIR}/RemoteEvent-Server-${ID}.js
cat $APP > $SERVER

if [ -f $SERVER ]; then
    isRun=$(check $SERVER);
    [ $isRun -eq -1 ] && { node $SERVER $ID $Host $ListenPort $PublishPort; }
else
    echoerr $APP: "server script doesn't exit."
    exit 1;
fi
