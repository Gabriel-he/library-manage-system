/*
 *  此文件实现与MySQL中用户信息表(user_table)交互
 */
var mysql = require('mysql');
var conf = require('../conf/db');
//获取用户表sql映射
var sql = require('./sqlMapping').user_table;
//用户验证
var logAction = require('../user_session/log.js');
// 使用连接池，提升性能
var pool = mysql.createPool({
    host: conf.mysql.host,
    user: conf.mysql.user,
    password: conf.mysql.password,
    database: conf.mysql.database,
    port: conf.mysql.port
});

module.exports = {
    update: function(req, res, next) {
        // update password        
        var name = req.body.name;
        var oldPassword = req.body.oldpswd;
        var newPassword = req.body.newpswd;

        pool.getConnection(function(err, connection) {
            //先检查原密码是否正确
            connection.query(sql.queryByName, name, function(err, result) {

                var pswdOnDB = result[0].PASSWORD;
                //原始密码错误
                if (oldPassword !== pswdOnDB) {
                    res.json({
                        code: 'fail',
                        msg: '操作失败',
                        redictUrl: '',
                    });
                } else {
                    //'UPDATE user_table SET PASSWORD=? WHERE NAME=?',
                    connection.query(sql.updatePswd, [newPassword, name], function(err, result) {
                        //update 成功
                        if (result.changedRows === 1) {
                            res.json({
                                code: 'ok',
                                msg: '操作成功',
                                redictUrl: '',
                            });
                        } else {
                            res.json({
                                code: 'fail',
                                msg: '操作失败',
                                redictUrl: '',
                            });
                        }
                    });

                }
                connection.release();
            });
        });
    },
    //need
    queryByName: function(req, res, next) {

        var name = req.body.name;
        pool.getConnection(function(err, connection) {
            //'SELECT * FROM news_table WHERE NAME=?'
            var con_ret = connection.query(sql.queryByName, name, function(err, result) {
                //向客户端返回的信息在verify函数中完成
                logAction.verify(req, res, next, result);
                //释放数据库连接
                connection.release();
            });
        });
    },
};