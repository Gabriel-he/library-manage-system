/**
 * 此文件用于登录验证与用户登出
 */
var userDao = require('../dao/userDao');
var session = require('../user_session/session');
var crypto = require('crypto');
/**
 * [getsha1 description]对目标字符串做sha-1编码,
 * 						使用node自带的crypto库函数进行包装。
 * @param  {[type]} str [description]需要做sha-1编码的字符串。
 * @return {[type]}     [description]返回编码好的字符串。
 */
function getsh1(str){
	var sha1 = crypto.createHash('sha1');
	sha1.update(str);
	str = sha1.digest('hex');
	return str;
}

module.exports = {
	verify: function(req, res, next, result){

		var name = req.body.name;
		var hashPswd = req.body.hashPswd;
		var nameOnDB = result[0].NAME;
		var pswdOnDB = result[0].PASSWORD;

		if ((nameOnDB === name) && (getsh1(pswdOnDB) === hashPswd)) {
			//验证成功,先判断是否重复登录
			if (session.onlineUsers.indexOf(name) !== -1) {
				//重复登录
				res.json({
		            code:'fail2',
		            msg: '重复登录',
		            redictUrl: '/',
	        	});
	        	//结束verify，不再向下执行
	        	return;	
			}
			
			var destUrl = '/profile';
			if (name === 'admin') {
				destUrl = '/manage';
			}
			res.json({
	            code:'ok',
	            msg: '登录成功',
	            redictUrl: destUrl,
        	});
        	session.userOnline(session.onlineUsers, name);

		} else {
			res.json({
	            code:'fail1',
	            msg: '登录失败',
	            redictUrl: '/',
        	});
		}

	},
	logout: function(req, res, next){
		//清除状态
		// user.name = "";
		// user.online = false;
		// token.content = null;
		var userCookie = req.cookies.username;
		session.userOffline(session.onlineUsers, userCookie);
		res.json({
			code:'logout',
	        msg: '退出成功',
	        redictUrl: "/",
        });
	}
};