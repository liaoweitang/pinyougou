// 定义购物车的控制器
app.controller('cartController', function ($scope, $controller, baseService) {

    // 继承baseController
    $controller('baseController', {$scope : $scope});

    // 查询购物车
    $scope.findCart = function () {
        baseService.sendGet("/cart/findCart").then(function(response){
            // 获取响应数据
            $scope.carts = response.data;
            $scope.totalEntity = {totalNum : 0, totalMoney : 0.00};
            $scope.sumTotalFee($scope.cartList);
        });
    };

    /** 定义数组封装选中的购物车商品 */
    $scope.cartList = [];



    /** 定义点击方法,得到选中的购物车商品 */
    $scope.updateSelection = function ($event, cart) {
        // 判断checkbox是否选中
        if ($event.target.checked) { // 选中
            $scope.cartList.push(cart);
        } else {
            var idx = $scope.cartList.indexOf(cart);
            $scope.cartList.splice(idx, 1);
        }
        $scope.sumTotalFee($scope.cartList);
    };

    /** 定义方法，计算购买商品的总金额 */
    $scope.sumTotalFee = function (cartList) {
            $scope.totalEntity = {totalNum : 0, totalMoney : 0.00};
            for (var i = 0;i < cartList.length;i++){
                // 获取购物车
                var cart = $scope.cartList[i];
                // 迭代购物车订单明细集合
                for (var j = 0; j < cart.orderItems.length; j++) {
                    // 获取订单明细
                    var  orderItem = cart.orderItems[j];
                    // 购买总件数
                    $scope.totalEntity.totalNum += orderItem.num;
                    // 购买总金额
                    $scope.totalEntity.totalMoney += orderItem.totalFee;
                }
          }
    };

    // 添加商品到购物车
    $scope.addCart = function (itemId, num,cart) {
        baseService.sendGet("/cart/addCart?itemId="
            + itemId + "&num=" + num).then(function(response){
            // 获取响应数据
            if (response.data){
                $scope.searchJsonByKey($scope.cartList,cart);
                // 重新查询购物车
                $scope.findCart();
            }
        });
    };

    /** 从json数组中根据key查询指定的json对象 */
    $scope.searchJsonByKey = function(cartList,value){
        /** 迭代json数组 */
        for(var i = 0; i < cartList.length; i++){
            var cart = cartList[i];
            var orderItems = cart.orderItems;
            for (var j = 0;j < orderItems.length;j++) {
                if(orderItems[i].itemId == value.orderItems.itemId){
                    var idx = $scope.cartList.indexOf(cart);
                    $scope.cartList.splice(idx, 1);
                    $scope.cartList.push(value);
                }
            }
        }
    };
});