// 定义基础的控制器
app.controller('baseController', function ($scope, baseService) {

    // 获取登录用户名
    $scope.loadUsername = function () {

        // 对请求URL进行unicode编码
        $scope.redirectUrl = window.encodeURIComponent(location.href);

        // 发送异步请求
        baseService.sendGet("/user/showName").then(function(response){
            // 获取响应数据
            $scope.loginName = response.data.loginName;
        });
    };
    this.uploadFile = function(){
        /** 创建表单对象 */
        var formData = new FormData();
        /** 追加需要上传的文件 */
        formData.append("file", file.files[0]);
        /** 发送异步请求上传文件 */
        return $http({
            method : 'post', // 请求方式
            url : "/upload", // 请求URL
            data : formData, // 表单数据
            headers : {'Content-Type' : undefined}, // 请求头
            transformRequest : angular.identity  // 转换对象
        });
    };

});