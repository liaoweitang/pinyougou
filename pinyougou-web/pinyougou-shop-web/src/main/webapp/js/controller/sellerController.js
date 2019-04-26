/** 定义控制器层 */
app.controller('sellerController', function($scope, $controller, baseService){

    /** 指定继承baseController */
    $controller('baseController',{$scope:$scope});
    /** 初始化 */
    $scope.find = function () {
        baseService.sendGet("/seller/findOne").then(function (response) {
            $scope.seller = response.data;
        });
    };
    /** 添加或修改 */
    $scope.saveOrUpdate = function(seller) {

        /** 发送post请求 */
        baseService.sendPost("/seller/update", $scope.seller)
            .then(function (response) {
                if (response.data) {
                    /** 跳转到登录页面 */
                    alert("修改成功");
                } else {
                    alert("操作失败！");
                }
            });
    };

$scope.findOldPassword=function () {
    /** 发送post请求 */
    baseService.sendPost("/seller/findOldPassword?oldPassword="+$scope.oldPassword)
        .then(function (response) {
            if (!response.data){
                alert("原密码错误!")
            }
        });

};
$scope.updatePassword=function () {
    if ($scope.newPassword == $scope.rePassword){
        /** 发送post请求 */
        baseService.sendPost("/seller/updatePassword?newPassword="+$scope.newPassword)
            .then(function (response) {
                if (response.data){
                    location.href="http://shop.pinyougou.com/shoplogin.html"
                }
            });
    }else {
        alert("两次新密码不一致！")
        $scope.newPassword="";
        $scope.rePassword="";
    }
};
























    /** 查询条件对象 */
    $scope.searchEntity = {};
    /** 分页查询(查询条件) */
    $scope.search = function(page, rows){
        baseService.findByPage("/seller/findByPage", page,
			rows, $scope.searchEntity)
            .then(function(response){
                /** 获取分页查询结果 */
                $scope.dataList = response.data.rows;
                /** 更新分页总记录数 */
                $scope.paginationConf.totalItems = response.data.total;
            });
    };

    /** 显示修改 */
    $scope.show = function(entity){
       /** 把json对象转化成一个新的json对象 */
       $scope.entity = JSON.parse(JSON.stringify(entity));
    };

    /** 批量删除 */
    $scope.delete = function(){
        if ($scope.ids.length > 0){
            baseService.deleteById("/seller/delete", $scope.ids)
                .then(function(response){
                    if (response.data){
                        /** 重新加载数据 */
                        $scope.reload();
                    }else{
                        alert("删除失败！");
                    }
                });
        }else{
            alert("请选择要删除的记录！");
        }
    };
});