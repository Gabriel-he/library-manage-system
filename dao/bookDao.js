/*
 *  此文件实现与MySQL中图书信息表(book_table)交互
 */
var mysql = require('mysql');
var conf = require('../conf/db');
//获取图书表sql映射
var sql = require('./sqlMapping').book_table;
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
                    //console.log('检查密码不对');
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
    queryByBookname: function(req, res, next) {
        //为模糊查询拼接字符串
        var bookName = '%' + req.body.bookName + '%';
        console.log("on server:"+bookName);
        pool.getConnection(function(err, connection) {
            //'SELECT * FROM news_table WHERE NAME=?'
            var con_ret = connection.query(sql.queryByBookname, bookName, function(err, result) {
                jsonWrite(res, result);
                connection.release();
            });
        });
    },
    queryByISBN: function(req, res, next) {
        var bookISBN = req.body.isbn;
        pool.getConnection(function(err, connection) {
            //'SELECT * FROM book_table WHERE ISBN=?'
            var con_ret = connection.query(sql.queryByISBN, bookISBN, function(err, result) {
                jsonWrite(res, result);
                connection.release();
            });
        });

    },
    queryAll: function(req, res, next){
        res.json({
            totalNum: '224',
            typeInfo: [
                {"计算机与互联网": '20'},
                {"少儿": '20'},
                {"教育": '20'},
                {"小说文学": '20'},
                {"经管": '20'},
                {"励志与成功": '20'},
                {"人文社科": '20'},
                {"生活": '30'},
                {"艺术摄影": '20'},
                {"科技": '18'},
                {"英文书/港台书": '13'},
                {"期刊/杂志": '3'}
            ]
        });
    },

};