/*
 *  此文件实现与MySQL中图书信息表(book_table)交互
 */
var mysql = require('mysql');
var conf = require('../conf/db');
//获取图书表sql映射
var sql = require('./sqlMapping').match_table;
// 使用连接池，提升性能
var pool = mysql.createPool({
    host: conf.mysql.host,
    user: conf.mysql.user,
    password: conf.mysql.password,
    database: conf.mysql.database,
    port: conf.mysql.port
});

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
    if(typeof ret === 'undefined' || ret === null) {
        res.json({
            code:'1',
            msg: '操作失败',
            redictUrl: '/login',
        });
    } else {
        res.json(ret);
    }
};

module.exports = {
    queryByUsername: function(req, res, next) {

        var username = req.body.username;

        pool.getConnection(function(err, connection) {
            //'SELECT * FROM news_table WHERE NAME=?'
            var con_ret = connection.query(sql.queryByUsername, username, function(err, result) {
                jsonWrite(res, result);
                connection.release();
            });
        });
    },
    queryAll: function(req, res, next) {

        pool.getConnection(function(err, connection) {
            //'SELECT * FROM news_table WHERE NAME=?'
            var con_ret = connection.query(sql.queryAll, function(err, result) {
                jsonWrite(res, result);
                connection.release();
            });
        });
    },

};