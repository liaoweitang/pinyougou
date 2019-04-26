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



    // 定义分页指令需要的配置信息对象
    $scope.paginationConf = {
        currentPage : 1, // 当前页码
        totalItems: 0, // 总记录数 (必须指定)
        itemsPerPage : 3, // 页大小
        //perPageOptions : [10,15,20,25,30], // 页码下拉列表框
        onChange : function () { // 页码发生改变会调用的函数
            $scope.reload();
        }
    };

    /** 加载数据方法 */
    $scope.reload = function () {
        $scope.search($scope.paginationConf.currentPage,
            $scope.paginationConf.itemsPerPage);
    };

    // 定义数组封装品牌id
    $scope.ids = [];

    // 为checkbox绑定点击事件，记录用户选择的品牌
    $scope.updateSelection = function (event, id) {
        // 获取dom元素
        //alert(event.target);
        // alert(event.target.checked); 判断checkbox是否选中
        if (event.target.checked){ // 选中
            // 往数组中添加元素
            $scope.ids.push(id);
        }else{ // 没选中
            // 获取元素在数组中的索引号
            var idx = $scope.ids.indexOf(id);

            // 删除数组元素的方法
            // 第一个参数：元素在数组中的索引号
            // 第二个参数: 从索引号开始，删除的个数
            $scope.ids.splice(idx, 1);
        }
    };

    /** 提取数组中json某个属性，返回拼接的字符串(逗号分隔) */
    $scope.jsonArr2Str = function (jsonArrStr, key) {
        // 把json数组的字符串转化成json数组
        var jsonArr = JSON.parse(jsonArrStr);

        var resArr = [];
        // 循环数组
        for (var i = 0; i < jsonArr.length; i++){
            // json : {id : '', text: ''}
            var json = jsonArr[i];
            resArr.push(json[key]);
        }
        // join: 把数组元素用什么隔开，返回一个字符串
        return resArr.join(",");
    };


});