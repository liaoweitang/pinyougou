// 定义购物车的控制器
app.controller('cartController', function ($scope, $controller, baseService) {

    // 继承baseController
    $controller('baseController', {$scope : $scope});

    // 查询购物车
    $scope.findCart = function () {
        baseService.sendGet("/cart/findCart").then(function(response){
            // 获取响应数据
            $scope.carts = response.data;
            // 初始化 checkedArr
            for (var i = 0 ;i < $scope.carts.length;i ++ ){
                $scope.checkedArr.push([]);
                $scope.ids.push([]);
            }
            getTotalMoneyAndNum();
        });
    };

    // 添加商品到购物车
    $scope.addCart = function (itemId, num,pindex,index,orderItem) {
        baseService.sendGet("/cart/addCart?itemId="
            + itemId + "&num=" + num).then(function(response){
            // 获取响应数据
            if (response.data){
                // 重新查询购物车
                $scope.findCart();

            }
        });
    };


// 存放被选中的商品
    $scope.ids=[];
    // 存放商品 的选中状态
    $scope.checkedArr=[];
    // 商家商品是否全选
    $scope.status=[];
    // 购物车集合商品是否全选
    $scope.flag=false;

    // 为单选checkbox绑定点击事件
    $scope.updateSelection = function(pindex,$event, oderItem, idx){

        var cart = $scope.carts[pindex];
        // 判断checkbox是否选中 dom
        // $event.target: dom
        if ($event.target.checked){ // 选中
            // 往数组中添加元素
            $scope.ids[pindex].push(oderItem);

            // 计算购物车集合中 确定要购买的商品的总价格 和总数量
            getTotalMoneyAndNum();

        }else { // 没有选中
            // 得到该元素在数组中的索引号
            var idx = $scope.ids[pindex].indexOf(oderItem);
            // 删除数组元素
            $scope.ids[pindex].splice(idx, 1);

            // 计算购物车集合中确定要购买的商品的总价格和总数量
            getTotalMoneyAndNum();
        }
        // 重新赋值，再次绑定checkbox
        $scope.checkedArr[pindex][idx] = $event.target.checked;
        // 判断商家商品全选是否选中,再次绑定checkbox
        $scope.status[pindex] = cart.orderItems.length == $scope.ids[pindex].length;
        isSelectAll();
    };

    // 全选商家购物车
    $scope.checkAllItem= function (index,$event) {
        //清空该商家的购物车商品
        $scope.ids[index]=[];
        // 获取商家的购物车
        var cart = $scope.carts[index];
        // 迭代商家购物车中的商品
        for (var i = 0; i < cart.orderItems.length; i++){
            // 判断是否选中
            if ($event.target.checked) {
                // 获取购买的商品
                var orderItem = cart.orderItems[i];
                // 已二维数组的形式添加到 ids
                $scope.ids[index][i] = orderItem;
                // 计算购物车集合中确定要购买的商品的总价格 和总数量
                getTotalMoneyAndNum();

            }else {
                // 计算购物车集合中确定要购买的商品的总价格 和总数量
                getTotalMoneyAndNum();
            }
            // 初始化二维数组
            $scope.checkedArr[index][i] = $event.target.checked;
            // 重新赋值 ,再次绑定 checkbox
            $scope.status[index] = cart.orderItems.length == $scope.ids[index].length;
        }
        isSelectAll();

    };
    // 判断是否购物车全选
    var isSelectAll = function () {
        if( $scope.status.length == $scope.carts.length ){
            // 判断每个商家的购物车的商品是否都被选中了
            for (var i = 0 ; i < $scope.status.length; i ++){
                if ($scope.status[i] == false){
                    $scope.flag = false;
                    return;
                }else {
                    $scope.flag = true;
                }
            }
        }
    };
    //  全选整个购物车集 方法
    $scope.checkAllcarts= function ($event) {
        for (var i = 0 ;i < $scope.carts.length; i++){
            if ($event.target.checked){
                $scope.checkAllItem(i,$event);
            }else {
                $scope.checkAllItem(i,$event);
            }
        }
        // 判断是否购物车全选
        isSelectAll();
    };

    // 算出 购物车集合中 选中的所有商品总金额
    var getTotalMoneyAndNum = function () {
        $scope.totalEntity = {totalNum : 0, totalMoney : 0};

        for (var i = 0 ;i < $scope.carts.length; i++){
            if ($scope.ids[i].length > 0) {
                for (var j = 0; j < $scope.ids[i].length; j++) {
                    // 确定购买 商品总数
                    $scope.totalEntity.totalNum += $scope.ids[i][j].num;
                    $scope.totalEntity.totalMoney += $scope.ids[i][j].totalFee;
                }
            }
        }
    }

});