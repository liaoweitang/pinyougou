// 定义购物车的控制器
app.controller('cartController', function ($scope, $controller, baseService) {

    // 继承baseController
    $controller('baseController', {$scope: $scope});

    // 查询购物车
    $scope.findCart = function () {
        baseService.sendGet("/cart/findCart").then(function (response) {
            // 获取响应数据
            $scope.carts = response.data;
            $scope.selectAll = false;
            $scope.totalEntity = {totalNum: 0, totalMoney: 0.00};
            $scope.sumTotalFee($scope.cartList);

        });
    };

    /** 定义数组封装选中的购物车商品 */
    $scope.cartList = [];


    /** 定义点击方法,得到选中的购物车商品 */
    $scope.updateSelection = function ($event, cart, index) {
        // 判断checkbox是否选中
        if ($event.target.checked) { // 选中
            /** 判断商家的商品是否存在购物车 */
            for (var i = 0; i < $scope.cartList.length; i++) {
                var carts = $scope.cartList[i];
                /** 存在则在原购物车上添加商品数据 */
                if (cart.sellerId == carts.sellerId) {
                    carts.orderItems.push(cart.orderItems[index]);
                    $scope.sumTotalFee();
                    return;
                }
            }
            $scope.cartList.push({
                "orderItems": [cart.orderItems[index]],
                "sellerName": cart.sellerName,
                "sellerId": cart.sellerId
            });
        } else {
            /** 判断商家的商品是否存在购物车 */
            for (var i = 0; i < $scope.cartList.length; i++) {
                var carts = $scope.cartList[i];
                /** 存在则在原购物车上删除商品数据 */
                if (cart.sellerId == carts.sellerId) {
                    var idx = $scope.cartList[i].orderItems.indexOf(cart.orderItems[index]);
                    alert(idx);
                    $scope.cartList[i].orderItems.splice(idx, 1);
                    $scope.sumTotalFee();
                    return;
                }
            }
            var idx = $scope.cartList.indexOf(cart);
            $scope.cartList.splice(idx, 1);
        }
        $scope.sumTotalFee();
    };

    /** 定义方法，计算购买商品的总金额 */
    $scope.sumTotalFee = function (catList) {
        $scope.totalEntity = {totalNum: 0, totalMoney: 0.00};
        for (var i = 0; i < $scope.cartList.length; i++) {
            // 获取购物车
            var cart = $scope.cartList[i];
            // 迭代购物车订单明细集合
            for (var j = 0; j < cart.orderItems.length; j++) {
                // 获取订单明细
                var orderItem = cart.orderItems[j];
                // 购买总件数
                $scope.totalEntity.totalNum += orderItem.num;
                // 购买总金额
                $scope.totalEntity.totalMoney += orderItem.totalFee;
            }
        }
    };

    // 添加商品到购物车
    $scope.addCart = function (itemId, num, cart) {
        baseService.sendGet("/cart/addCart?itemId="
            + itemId + "&num=" + num).then(function (response) {
            // 获取响应数据
            if (response.data) {
                // 重新查询购物车
                $scope.findCart();
                // $scope.searchJsonByKey($scope.cartList,num,cart);
            }
        });
    };

    /** 判断购物车是否被选中 */
    $scope.isSelect = function () {
        for (var k = 0; k < $scope.carts.length; k++) {
            var cart = $scope.carts[k];
            // 迭代购物车数组
            for (var i = 0; i < $scope.cartList.length; i++) {
                var carts = $scope.cartList[i];
                for (var j = 0; j < carts.orderItems.length; j++) {
                    var itemId1 = carts.orderItems[j].itemId;
                    if (itemId1 == cart.orderItems[0].itemId) {
                        return true;
                    }
                }
            }
        }
        return false;
    };


    /** 全选同一商家的购物车 */
    $scope.selectAll1 = function ($event, cart) {
        // 选中则添加该商家全部的商品;
        if ($event.target.checked) {
            // 先删除商品，再添加回去
            $scope.deleteBySellerId(cart.sellerId);
            $scope.cartList.push(cart);

        } else { // 取消则从数组删除该商家全部商品
            $scope.deleteBySellerId(cart.sellerId);
        }
    };

    /** 全选所有的商品 */
    $scope.selectAllCart = function ($event) {
        // 选中则添加全部的商品;

        if ($event.target.checked) {
            // 先删除商品，再添加回去
            $scope.cartList= [];
            for (var i = 0;i<$scope.carts.length;i++){
                $scope.cartList.push($scope.carts[i])
            }
            $scope.sumTotalFee($scope.cartList);
        } else { // 取消则从数组删除该商家全部商品
            $scope.cartList= [];
        }
    };

    // 根据商家id删除cartList数组对应的商家订单
    $scope.deleteBySellerId = function (sellerId) {
        for (var i = 0; i < $scope.cartList.length; i++) {
            var cart = $scope.cartList[i];
            if (cart.sellerId == sellerId) {
                // 先从数组删除该商家的商品，再全部添加进去
                var idx = cart.sellerId.indexOf(sellerId);
                $scope.cartList.splice(idx, 1);
            }
        }
    }
});