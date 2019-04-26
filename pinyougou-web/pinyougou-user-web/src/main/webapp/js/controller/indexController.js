/** 定义控制器层 */
app.controller('indexController', function($scope, baseService,$controller){

    $controller('baseController',{$scope:$scope});
    /** 定义获取登录用户名方法 */
    $scope.showName = function(){
        baseService.sendGet("/user/showName")
            .then(function(response){
                $scope.loginName = response.data.loginName;
                $scope.searchParam.userId = $scope.loginName;
                $scope.findOrderByUserId();
            });
    };

    // 商品操作状态
    $scope['status'] = [['未付款','等待卖家付款','取消订单'],['已付款,等待发货','未发货','取消订单'],
        ['已付款','已发货','确认收货'],['已付款','已发货','待评价'],['已付款','已发货','交易成功'],['已付款','部分发货','确认收货']];


    // 商品操作状态显示
    $scope.showStatus = function (status) {

        if (status == '1') {
            return 0;
        } else if (status == '2' || status == '3'){
            return 1;
        } else if (status == '4'){
            return 2;
        } else if (status == '5'){
            return 4;
        }else if (status == '7'){
            return 3;
        }else {
            return 5;
        }
    };

    /**定义订单页参数对象*/
    $scope.resultMap = {orders:[],totalPages:""};

    // 获取用户的订单数据
    $scope.findOrderByUserId = function () {

        baseService.sendPost("/order/findOrderByUserId",$scope.searchParam ).then(function (response) {
            /** 获取搜索结果 */
            $scope.resultMap = response.data;
            /** 调用初始化页码方法 */
            initPageNum();
        })
    };

    // 跳转到详情页
    $scope.showItem = function (goodId) {

        alert(goodId);
        location.href = "http://item.pinyougou.com/" + goodId + ".html";
    };

    $scope.searchParam = {page:'1',userId:''};
    /** 定义初始化页码方法 */
    var initPageNum = function(){
        /** 定义页码数组 */
        $scope.pageNums = [];
        /** 获取总页数 */
        var totalPages = $scope.resultMap.totalPages;
        /** 开始页码 */
        var firstPage = 1;
        /** 结束页码 */
        var lastPage = totalPages;
        /** 如果总页数大于5，显示部分页码 */
        if (totalPages > 5){
            // 如果当前页码处于前面位置
            if ($scope.searchParam.page <= 3){
                lastPage = 5; // 生成前5页页码
            }
            // 如果当前页码处于后面位置
            else if ($scope.searchParam.page >= totalPages - 3){
                firstPage = totalPages - 4;  // 生成后5页页码
            }else{ // 当前页码处于中间位置
                firstPage = $scope.searchParam.page - 2;
                lastPage = $scope.searchParam.page + 2;
            }
        }
        /** 循环产生页码 */
        for (var i = firstPage; i <= lastPage; i++){
            $scope.pageNums.push(i);
        }
    };

    /** 根据分页搜索方法 */
    $scope.pageSearch = function(page){
        page = parseInt(page);
        /** 页码验证 */
        if (page >= 1 && page <= $scope.resultMap.totalPages
            && page != $scope.searchParam.page){
            $scope.searchParam.page = page;
            $scope.findOrderByUserId();
        }
    };
});