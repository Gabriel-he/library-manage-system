/**
 * 此文件用于存储用户在线状态，避免重复登录
 */

module.exports = {
    onlineUsers : [
        // 格式如下
        // 'aaa',
        // 'bbb'         
    ],
    userOnline: function(onlineUsers, username) {
        onlineUsers.push(username);
    },
    userOffline: function(onlineUsers, username) {
        onlineUsers.splice(onlineUsers.indexOf(username),1);
    },
    userCheck: function(onlineUsers, req) {
        var userCookie = req.cookies.username;
        //boolean here
        var userLogged = (onlineUsers.indexOf(userCookie) !== -1);

        return userLogged;
    }
};

