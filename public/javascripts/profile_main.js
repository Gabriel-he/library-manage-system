app = angular.module('managePageApp', ['ngAnimate', 'ngSanitize', 'ngCookies', 'ui.bootstrap']);

app.controller('UserDropdownCtrl', function($scope, $cookies, $http, $log) {

    $scope.status = {
        isopen: false
    };
    $scope.username = $cookies.get('username');
    //处理用户下拉列表
    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
    //用户登出操作，清除cookie并跳转页面
    $scope.userLogout = function($event) {

        $event.preventDefault();
        $event.stopPropagation();

        $http({
            method: 'POST',
            url: '/logout',
        }).then(function(response) {
            $scope.status = response.status;
            $scope.data = response.data;

            if ($scope.data.code === 'logout') {
                //清除cookie信息     
                $cookies.put('username', '');
                window.location.href = $scope.data.redictUrl;
            } else {
                $cookies.put('username', '');
                window.location.href = '/';
            }
        }, function(response) {
            alert("网络错误，登出失败");
        });
    };

});
/**
 * [description] 全局controlller，主要用于处理需要跨区域的操作
 *               例如nav与section之间的元素之间的交互操作
 * @param  
 * @return
 */
app.controller('GlobalCtrl', function($scope, $http) {

    //默认显示首屏
    $scope.setShow = [true, false, false];
    //响应点击页面切换
    $scope.contentChosen = function($event, index) {
        for (var i = 0; i < $scope.setShow.length; i++) {
            if (i == index) {
                $scope.setShow[i] = true;
            } else {
                $scope.setShow[i] = false;
            }
        }
    };
    //用户下拉菜单中profile按钮直接导航到最末屏的profile content
    $scope.getProfile = function($event) {
        //跳转最末屏
        $scope.contentChosen($event, 2);
    };
    /**
     * 以下代码块为图书搜索结果分页控制
     * 
     */
    $scope.maxSize = 5; //最多可选分页按钮(显示，其余按钮被ellipses)
    //根据窗口宽度调整每页显示个数
    $scope.itemsPerPage = 5; //固定为5个，table方式呈现
    //初始化为0，后在bookSearch()中根据数据库查询结果赋值
    $scope.totalItems = 0;
    $scope.currentPage = 1; //初始页面为1
    //页面跳转，触发页面重绘到制定页面内容
    $scope.pageChanged = function() {
        //console.log('Page changed to: ' + $scope.currentPage);
        $scope.resultShow($scope.data, $scope.totalItems, $scope.currentPage, $scope.itemsPerPage);
    };
    /**
     * [resultShow description] 用于从搜索结果中装载需要在当前页面显示的结果
     * @param  {[type]} data          [description] 搜索总结果
     * @param  {[type]} pageNum       [description] 当前页面编号
     * @param  {[type]} itemsPerPage  [description] 页面展示结果数
     * @return {[type]}         [description]
     */
    $scope.resultShow = function(data, length, pageNum, itemsPerPage) {
        var start = (pageNum - 1) * itemsPerPage;
        //避免越界
        var stop = Math.min((start + itemsPerPage), (length));
        //重置
        $scope.bookSearchSet = [];

        for (var i = start; i < stop; i++) {
            $scope.bookSearchSet.push(data[i]);
        }
    };
    /**
     * [bookSearch description] 响应图书搜索按钮点击事件主操作函数
     * @param  {[type]} $event [description]
     * @return {[type]}        [description]
     */
    //bookset数组用于承载当前页面所需展示的搜索结果
    $scope.bookSearchSet = [];
    $scope.searchResultShow = false;
    $scope.searchAlertShow = true;
    $scope.bookSearch = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        //跳转第二屏
        $scope.contentChosen($event, 1);

        var bookName = $scope.bookSearchText;
        //输入必须为中文或英文，长度不超过20
        var bookReg = /[\u4e00-\u9fa5a-zA-Z]{1,20}/;
        if (!bookReg.test(bookName)) {
            return;
        }
        if (bookName === undefined || bookName == "") {
            return;
        }

        $http({
            method: 'POST',
            url: '/query_bookname',
            data: {
                bookName: bookName,
            }
        }).then(function(response) {
            $scope.status = response.status;
            $scope.data = response.data;
            //显示页面结果
            if ($scope.data.length > 0) {
                $scope.totalItems = $scope.data.length;
                $scope.searchResultShow = true;
                $scope.searchAlertShow = false;
                $scope.resultShow($scope.data, $scope.totalItems, $scope.currentPage, $scope.itemsPerPage);
            }
            // console.log("database query ret:");
            // console.log($scope.data);        
        }, function(response) {
            $scope.data = response.data || 'Request failed';
            $scope.status = response.status;
            console.log("网络通信错误");
        });
    };
});

app.controller('AlertBannerCtrl',function($scope) {
    /**
     * 以下代码块为第二屏展示的alert bnnner相关控制
     */
    $scope.alerts = [{
        type: 'info',
        msg: '请使用上面搜索框进行图书搜索！'
    }];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});
/**
 * [description] BookBorrowedInfoCtrl主要用于第1屏展示用户借阅信息的控制
 * @param  {[type]} $scope     [description]
 * @param  {[type]} $cookies   [description]
 * @param  {[type]} $http){} [description]
 * @return {[type]}            [description]
 */
app.controller('BookBorrowedInfoCtrl', function($scope, $cookies, $http) {
    //通过自执行函数在用户登录跳转到此页面后
    //即开始查询数据库获取数据进行页面构造
    (function() {
        $scope.username = $cookies.get('username');
        $http({
            method: 'POST',
            url: '/query_match',
            data: {
                username: $scope.username
            }
        }).then(function(response) {
            $scope.status = response.status;
            $scope.data = response.data;

            //此处处理返回数据,BOOK_ISBN为string,用逗号分隔
            var strISBN = $scope.data[0].BOOK_ISBN;
            //解析为数组以便进一步查询
            var arrISBN = strISBN.split(",");

            //置空，用于装载返回图书详细信息以构造页面
            $scope.bookBorrowed = [];
            for (var i = 0; i < arrISBN.length; i++) {
                var isbn = arrISBN[i];
                $http({
                    method: 'POST',
                    url: '/query_bookISBN',
                    data: {
                        isbn: isbn
                    }
                }).then(function(response) {
                    $scope.data = response.data;
                    //ISBN唯一，返回内容仅一条
                    $scope.bookBorrowed.push($scope.data[0]);
                }, function(response) {
                    console.log("query ISBN error due to communication");
                });
            }
        }, function(response) {
            alert("网络错误，获取读者借阅信息失败");
        });
    })();

    $scope.getJsonLength = function(json) {
        var length = 0;
        for (var obj in json) {
            length++;
        }
        return length;
    };


});
/**
 * [description] ProfileFormCtrl主要处理profile页面中用户更换密码等操作
 * @param  {[type]} $scope   [description]
 * @param  {[type]} $cookies [description]
 * @return {[type]}          [description]
 */
app.controller('ProfileFormCtrl', function($scope, $cookies, $http) {
    //更改密码使用的正则
    $scope.pswdPattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
    //检查两次输入是否一致，控制提示信息显隐
    $scope.changeCheck = function() {
        if (($scope.newpswd1 !== undefined) && ($scope.newpswd2 !== undefined)) {
            return ($scope.newpswd1 != $scope.newpswd2);
        } else {
            return false;
        }
    };
    //用户点击确定，进行更改密码业务逻辑
    $scope.confirm = function() {
        var name = $cookies.get('username');
        var oldpswd = $scope.oldpswd;
        var newpswd = $scope.newpswd2;

        $http({
            method: 'POST',
            url: '/update_pswd',
            data: {
                name: name,
                oldpswd: oldpswd,
                newpswd: newpswd,
            }
        }).then(function(response) {
            $scope.status = response.status;
            $scope.data = response.data;

            if ($scope.data.code === 'ok') {
                alert('密码更改成功');
            } else {
                alert('密码更改失败');
            }
        }, function(response) {
            $scope.data = response.data || 'Request failed';
            $scope.status = response.status;

            alert('网络通信失败');
        });
    };
});