var app = angular.module('homePageApp', ['ui.bootstrap', 'ngCookies']);

app.controller('HomepageCtrl', ['$scope', '$interval', '$http',
  function($scope, $interval, $http) {

    var dateUpdater;
    //使用mommentjs获取及格式化日期
    $scope.updateTime = function() {
      //引入汉化库
      moment.locale('zh-cn');
      $scope.dateTime = moment().format('LL LTS');

    };
    //使用ng封装的定时器
    dateUpdater = $interval(function() {
      $scope.updateTime();
    }, 1000);
    //定时更换背景图片
    var bgChanger;
    var bgContainer = document.getElementsByClassName('container')[0];
    $scope.changeBackgourndPic = function() {
      var index = Math.floor(Math.random() * 6);
      bgContainer.style.background = 'url(images/background_pics/' + index + '.jpg)';
      bgContainer.style.backgroundSize = 'cover';
    };
    bgChanger = $interval(function() {
      $scope.changeBackgourndPic();
    }, 9000);


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
      $scope.bookset = [];

      for (var i = start; i < stop; i++) {
        $scope.bookset.push(data[i]);
      }
    };
    /**
     * 以下代码块为图书搜索结果分页控制
     * 
     */
    $scope.maxSize = 5; //最多可选分页按钮(显示，其余按钮被ellipses)
    //根据窗口宽度调整每页显示个数
    $scope.itemsPerPage = (window.innerWidth > 1100) ? 6 : 3; 
    //初始化为0，后在bookSearch()中根据数据库查询结果赋值
    $scope.totalItems = 0;
    $scope.currentPage = 1; //初始页面为1
    //页面跳转，触发页面重绘到制定页面内容
    $scope.pageChanged = function() {
      //console.log('Page changed to: ' + $scope.currentPage);
      $scope.resultShow($scope.data, $scope.totalItems, $scope.currentPage, $scope.itemsPerPage);
    };

    /**
     * 以下代码块处理主页书籍搜索事件
     */
    //操作搜索栏左侧图标
    var bookIcon = document.getElementById('book-icon');
    //bookset数组用于承载当前页面所需展示的搜索结果
    $scope.bookset = [];
    $scope.searchResultShow = false;
    $scope.searchAlertShow = false;
    $scope.bookSearch = function() {
      //重绘背景
      $interval.cancel(bgChanger);
      bgContainer.style.background = 'none';
      bgContainer.style.backgroundColor = '#EEE';
      bookIcon.src = 'images/book_dark.png';
      //通过改变class使搜索框上移
      $scope.changeSearchBoxPosition = true;

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
        $scope.searchResultShow = true;
        if ($scope.data.length > 0) {
          $scope.totalItems = $scope.data.length;
          $scope.resultShow($scope.data, $scope.totalItems, $scope.currentPage, $scope.itemsPerPage);
        } else {
          $scope.searchAlertShow = true;
          $scope.addAlert('warning', '经查询，馆藏无此书!');
        }

        // console.log("database query ret:");
        // console.log($scope.data);        
      }, function(response) {
        $scope.data = response.data || 'Request failed';
        $scope.status = response.status;

      });

    };
    /**
     * 以下代码块为第二屏展示的alert bnnner相关控制
     */
    $scope.alerts = [];
    $scope.addAlert = function(type, msg) {
      $scope.alerts.push({type: type, msg: msg});
    };
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    /**
     * 监控页面宽度变化，对搜索结果进行重绘
     * 
     */
    $scope.$watch(
      function() { return window.innerWidth; },
      function(value) {
        $scope.itemsPerPage = (window.innerWidth > 1100) ? 6 : 3;
        //页面大小变化，触发当前页面重绘
        $scope.resultShow($scope.data, $scope.totalItems, $scope.currentPage, $scope.itemsPerPage);
      }
    );
  }
]);

app.controller('ModalCtrl', function($scope, $uibModal, $log) {

  $scope.animationsEnabled = true;

  $scope.open = function(size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
    });

    // modalInstance.result.then(function (selectedItem) {
    //   $scope.selected = selectedItem;
    // }, function () {
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
  };

});
//
/**
 * [description] 用于ModalInstanceCtrl和LogInController之间
 *               传递输入的用户账户名密码信息
 * @param  
 * @return
 */
app.factory('UserData', function() {
  return {
    name: '',
    pswd: '',
  };
});
// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
app.controller('ModalInstanceCtrl',
  function($scope, $http, $cookies, $uibModalInstance, UserData) {

    $scope.warningString = "请输入用户名密码！";
    $scope.illegalInput = false;
    //在此处处理验证登录请求
    $scope.ok = function() {

      if ((UserData.name == undefined || UserData.name == "")
          || (UserData.pswd == undefined || UserData.pswd == "")) {
        $scope.illegalInput = true;
        $scope.warningString = "用户名密码不完整！";
        
        return;
      }
      var reg = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
      if ((!reg.test(UserData.name)) || (!reg.test(UserData.pswd))) {
        $scope.illegalInput = true;
        $scope.warningString = "用户名密码错误！";

        return; 
      }


      // 验证,用户名明文，密码sha1加密
      var name = UserData.name;
      var hashPswd = getsha1(UserData.pswd);

      $http({
        method: 'POST',
        url: '/query_name',
        data: {
          name: name,
          hashPswd: hashPswd,
        }
      }).then(function(response) {
        $scope.status = response.status;
        $scope.data = response.data;

        if ($scope.data.code === 'ok') {
          //向cookie中写入数据
          $cookies.put('username', name);
          //登录成功跳转
          window.location.href = $scope.data.redictUrl;
        } else if ($scope.data.code === 'fail2') {
          $scope.illegalInput = true;
          $scope.warningString = "请勿重复登录！";

        } else {
          $scope.illegalInput = true;
          $scope.warningString = "登录验证失败！";
        }
      }, function(response) {
        $scope.data = response.data || 'Request failed';
        $scope.status = response.status;
        $scope.illegalInput = true;
        $scope.warningString = "登录通信失败！";
      });



      //$uibModalInstance.close('ok');
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });

app.controller('LogInController', function($scope, UserData) {

  $scope.user = {
    name: '',
    pswd: '',
    //4-15位以字母开头包含下划线和数字
    namePattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/,
    pswdPattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/
  };
  $scope.nameChange = function() {
    UserData.name = $scope.user.name;
  };
  $scope.pswdChange = function() {
    UserData.pswd = $scope.user.pswd;
  };
});

/**
 * [getsha1 description]对目标字符串做sha-1编码,使用sha.js的函数进行包装
 * @param  {[type]} str [description]需要做sha-1编码的字符串
 * @return {[type]}     [description]返回编码好的字符串
 */
function getsha1(str) {
  var shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.update(str);
  str = shaObj.getHash("HEX");
  return str;
}