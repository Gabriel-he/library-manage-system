/**
 * 项目路由主文件
 */
var express = require('express');
var router = express.Router();
// 引入session以控制重复登录
var session = require('../user_session/session');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});
/* GET readme */
router.get('/readme', function(req, res, next) {
    res.render('readme');
});
/* 对GET Profile 和 manage 页面的请求
 * 需要判断是否已经登录
 */
router.get('/profile', function(req, res, next) {

    var logged = session.userCheck(session.onlineUsers, req);
    if (logged === true) {
        //已登录，正常跳转
        res.render('profile');
    } else {
        //未登录，重定向到homepage
        res.redirect('/');
    }
});
router.get('/manage', function(req, res, next) {

    var logged = session.userCheck(session.onlineUsers, req);
    if (logged === true) {
        //已登录，正常跳转
        res.render('manage');
    } else {
        //未登录，重定向到homepage
        res.redirect('/');
    }
});

/**
 * [userDao description]
 * 以下代码块为user_table的相关操作路由
 */
var userDao = require('../dao/userDao');
router.post('/query_name', function(req, res, next) {

    userDao.queryByName(req, res, next);
});
router.post('/update_pswd', function(req, res, next) {

    userDao.update(req, res, next);
});

/**
 * [bookDao description]
 * 以下代码块为book_table的相关操作路由
 */
var bookDao = require('../dao/bookDao');
router.post('/query_bookname', function(req, res, next) {

    bookDao.queryByBookname(req, res, next);
});
router.post('/query_bookISBN', function(req, res, next) {

    bookDao.queryByISBN(req, res, next);
});
router.post('/query_bookAll', function(req, res, next) {

    bookDao.queryAll(req, res, next);
});
/**
 * [matchDao description]
 * 以下代码块为match_table(用户与图书表之间的映射表)的相关操作路由
 */
var matchDao = require('../dao/matchDao');
router.post('/query_match', function(req, res, next) {
    
    matchDao.queryByUsername(req, res, next);
});
router.post('/query_matchAll', function(req, res, next) {
    
    console.log("into query_matchALL route");
    matchDao.queryAll(req, res, next);
});

/* *
 * 处理用户退出登录，验证登录在/query_name操作之后已经完成
 * 故此处不再提供路由
 */
var logAction = require('../user_session/log.js');
//用户登出
router.post('/logout', function(req, res, next) {
    logAction.logout(req, res, next);
});

module.exports = router;