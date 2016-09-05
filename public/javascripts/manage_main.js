app = angular.module('managePageApp', ['ngAnimate', 'ngSanitize', 'ngCookies', 'ui.bootstrap']);

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
/**
 * [description] UserDropdownCtrl用于控制顶部用户下拉菜单
 *                 包括跳转跟退出等操作
 * @param  {[type]} $scope   [description]
 * @param  {[type]} $cookies [description]
 * @param  {[type]} $http    [description]
 * @param  {Object} $log     [description]             
 * @return {[type]}          [description]
 */
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
 * [description] 为第二屏展示的alert bnnner相关控制
 * @param  
 * @return {[type]}         [description]
 */
app.controller('AlertBannerCtrl', function($scope) {
    $scope.alerts = [{
        type: 'info',
        msg: '请使用上面搜索框进行图书搜索！'
    }];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
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
/**
 * [description] 使用d3.js绘制图形，使数据可视化
 * @param  {[type]} $scope [description]
 * @param  {[type]} $http  [description]
 * @return {[type]}        [description]
 */
app.controller('ChartCtrl', function($scope, $http) {
    //自执行函数获取数据
    $scope.matchData = [];
    $scope.bookData = {};
    (function() {
        //获取book表内容
        $http({
            method: 'POST',
            url: '/query_bookAll',

        }).then(function(response) {
            $scope.status = response.status;
            console.log('resdata1:');
            console.log(response.data);
            $scope.bookData = response.data;
            //获取映射表内容
            $http({
                method: 'POST',
                url: '/query_matchAll',

            }).then(function(response) {
                $scope.status = response.status;
                console.log('resdata2:');
                console.log(response.data);
                if (response.data.length > 0) {
                    $scope.matchData = response.data;
                }
                //构造读者相关数据
                $scope.userPieChartData = []; //读者信息饼图数据
                var userPieText = [];
                $scope.bookLentNum = 0; //图书馆出借书目数量
                for (var i = 0; i < $scope.matchData.length; i++) {
                    var username = $scope.matchData[i].USER_NAME;
                    var bookBorrowedNum = $scope.matchData[i].BOOK_BORROWED_NUM;
                    userPieText.push(username);
                    $scope.userPieChartData.push(bookBorrowedNum);
                    $scope.bookLentNum += $scope.matchData[i].BOOK_BORROWED_NUM;
                }

                var inStockNum = $scope.bookData.totalNum - $scope.bookLentNum;
                //图书信息饼图数据
                $scope.bookPieChartData = [inStockNum, $scope.bookLentNum];
                //图书信息直方图数据
                $scope.bookHistogramData = $scope.bookData.typeInfo;

                /**
                 * 调用绘图相关函数进行图标绘制
                 * draw类函数均使用了d3.js库
                 */
                $scope.drawPieChart("#d3-bookpie", $scope.bookPieChartData);
                var bookPieText = ["库存图书", "出借图书"];
                $scope.drawTable("#d3-bookpie", $scope.bookPieChartData, bookPieText);

                //第二个饼图
                $scope.drawPieChart("#d3-userpie", $scope.userPieChartData);
                $scope.drawTable("#d3-userpie", $scope.userPieChartData, userPieText);
                //直方图
                $scope.drawHistogram("#d3-histogram", $scope.bookData.typeInfo);

            }, function(response) {
                console.log("网络通信错误");
            });

        }, function(response) {
            console.log("网络通信错误");
        });

    })();


    $scope.drawPieChart = function(position, dataset) {
        var width = 250;
        var height = 250;
        //生成svg并插入文档对应位置
        var bookPieSvg = d3.select(position)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        var pie = d3.pie();

        var pieData = pie(dataset);
        var outerRadius = 100; //外半径
        var innerRadius = 0; //内半径，为0则中间没有空白

        var arc = d3.arc() //弧生成器
            .innerRadius(innerRadius) //设置内半径
            .outerRadius(outerRadius); //设置外半径
        //应用于mouseover事件
        var arcOn = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius + 10);

        var color = d3.schemeCategory10;
        //在<svg>里添加足够数量的分组元素g，
        //每一个分组用于存放一段弧的相关元素
        var arcs = bookPieSvg.selectAll("g")
            .data(pieData)
            .enter()
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");
        //对每个g元素添加path             
        arcs.append("path")
            .attr("fill", function(d, i) {
                return color[i];
            })
            .attr("d", function(d) {
                //console.log(d);
                return arc(d);
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        function mouseover() {
            d3.event.preventDefault();
            d3.event.stopPropagation();

            d3.select(this)
                .transition()
                .duration(500)
                .attr("d", function(d) {
                    return arcOn(d);
                });
        }

        function mouseout() {
            d3.event.preventDefault();
            d3.event.stopPropagation();

            d3.select(this)
                .transition()
                .duration(500)
                .attr("d", function(d) {
                    //console.log(d);
                    return arc(d);
                });
        }
    };

    $scope.drawTable = function(position, dataset, textset) {

        //引入相同色彩集
        var color = d3.schemeCategory10;
        //插入table
        var table = d3.select(position)
            .append("table")
            .attr('class', 'table table-hover table-condensed');
        //插入足够的tr
        var tr = table.append("tbody")
            .selectAll("tr")
            .data(dataset)
            .enter()
            .append("tr");
        tr.append("td")
            .append("svg")
            .attr("width", '16')
            .attr("height", '16')
            .append("rect")
            .attr("width", '16')
            .attr("height", '16')
            .attr("fill", function(d, i) {
                return color[i];
            });
        tr.append("td")
            .text(function(d, i) {
                return textset[i];
            });
        tr.append("td")
            .text(function(d, i) {
                return (d + "(册)");
            });
    };

    $scope.drawHistogram = function(position, dataset) {
        //初始化
        var binNum = dataset.length,
            rangeArray = [],
            pureNum = [],
            text = [];
        var rectWidth = 70;
        var scale = 5;//比例尺放大5倍
        var axisHeight = 20;
        for (var i = 0; i < binNum; i++) {
            //dataset数组每个元素为单一键值对对象
            var textTmp = Object.keys(dataset[i])[0];
            var numTmp = dataset[i][textTmp];
            text.push(textTmp);
            pureNum.push(numTmp);
            rangeArray.push(40 + (rectWidth) * i);
        }
        //定义svg
        var width = 900,
            height = 200;

        var svg = d3.select(position)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
        var xOffset = 40;
        var rect = svg.selectAll("rect")
                      .data(pureNum)
                      .enter()
                      .append("rect")
                      .attr("x", function(d,i) {
                           return xOffset + i * rectWidth;
                      })
                      .attr("y", function(d){
                           return height - d * scale - axisHeight;
                      })
                      .attr("width", rectWidth - 30)
                      .attr("height", function(d) {
                           return d * scale;
                      })
                      .attr("fill","steelblue")
                      .on("mouseover", mouseover)
                      .on("mouseout", mouseout);

        var rectText = svg.selectAll("text")
                          .data(pureNum)
                          .enter()
                          .append("text")
                          .attr("x", function(d,i) {
                              return xOffset + 10 + i * rectWidth;        
                          })
                          .attr("y", function(d){
                              return height - d * scale - 5;
                          })
                          .attr("class","text-in-rect")
                          .text(function(d){
                              return d;
                          });

        var x = d3.scaleOrdinal()
                  .range(rangeArray)
                  .domain(text);         
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + (height-axisHeight) + ")")
           .call(d3.axisBottom(x));
        
        function mouseover(){
            d3.event.preventDefault();
            d3.event.stopPropagation();

            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill","#7BA7CA");
                
        }
        function mouseout(){
            d3.event.preventDefault();
            d3.event.stopPropagation();

            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill","steelblue");
        }

    };

});