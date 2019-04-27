/** 定义控制器层 */
app.controller('userController', function($scope, $timeout, baseService,$controller){


    // 定义user对象
    $scope.user = {};

    /** 用户注册 */
    $scope.save = function () {

        // 判断两次密码是否一致
        if ($scope.okPassword && $scope.user.password == $scope.okPassword){
            // 发送异步请求
            baseService.sendPost("/user/save?code=" + $scope.code, $scope.user)
                .then(function(response){
                    if (response.data){
                        // 清空表单数据
                        $scope.user = {};
                        $scope.okPassword = "";
                        $scope.code = "";
                    }else{
                        alert("注册失败！");
                    }
                });

        }else{
            alert("两次密码不一致！");
        }
    };


    // 发送短信验证码
    $scope.sendSmsCode = function () {

        // 判断手机号码
        if ($scope.user.phone && /^1[3|4|5|7|8]\d{9}$/.test($scope.user.phone)){
            // 发送异步请求
            baseService.sendGet("/user/sendSmsCode?phone=" + $scope.user.phone)
                .then(function(response){
                    if (response.data){
                        // 调用倒计时方法
                        $scope.downcount(90);

                    }else{
                        alert("发送失败！");
                    }
                });
        }else {
            alert("手机号码格式不正确！")
        }
    };


    $scope.smsTip = "获取短信验证码";
    $scope.disabled = false;

    // 倒计时方法
    $scope.downcount = function (seconds) {

        seconds--;

        if (seconds >= 0){
            $scope.smsTip = seconds + "秒后，重新获取！";
            $scope.disabled = true;
            // 第一个参数：回调的函数
            // 第二个参数：间隔的时间毫秒数
            $timeout(function(){
                $scope.downcount(seconds);
            }, 1000);
        }else {
            $scope.smsTip = "获取短信验证码";
            $scope.disabled = false;
        }

    };
    //查询用户所有地地址
    $scope.findAddress=function () {
        baseService.sendGet("/user/findAddress").then(function (response) {
      $scope.dataList = response.data;

        });
    };

    //省市县区查询
    $scope.findName=function () {
        baseService.sendGet("/user/findName").then(function (response) {
            $scope.name=response.data.loginName;
        });
    };


    $scope.findProvince = function (name) {
        baseService.sendGet("/user/findProvincesList").then(function (response) {
            $scope[name] = response.data;
        })
    };

    $scope.findCityByProvinceId=function (provinceId, name) {
        baseService.sendGet("/user/findCityList","provinceId="+provinceId).then(function (response) {
            $scope[name]=response.data;
        });
    };


    $scope.$watch('provinces.provinceId', function (newVal, oldVal) {
        //alert("新值：" + newVal + ",旧值:" + oldVal);
        if (newVal){ // 不是undefined、null
            // 查询二级分类
            $scope.findCityByProvinceId(newVal, "city");
        }else {
            $scope.city = [];
        }
    });

    $scope.findAreasByCityId=function (cityId, name) {
        baseService.sendGet("/user/findAreasList","cityId="+cityId).then(function (response) {
            $scope[name]=response.data;
        });
    };


    $scope.$watch('city.cityId', function (newVal, oldVal) {
        //alert("新值：" + newVal + ",旧值:" + oldVal);
        if (newVal){ // 不是undefined、null
            // 查询二级分类
            $scope.findAreasByCityId(newVal, "areas");
        }else {
            $scope.areas= [];
        }
    });


$scope.add={contact:'',address:'',mobile:'',notes:'',alias:'',province:'',city:'',area:''};
    $scope.getAddress = function (name,id) {
        $scope.add[name] = id;
    };

    $scope.mesTip1 = "家里";
    $scope.mesTip2 = "父母家";
    $scope.mesTip3 = "公司";

    $scope.changeAdress1 = function () {
        $scope.add.alias = $scope.mesTip1;
    };

    $scope.changeAdress2 = function () {
        $scope.add.alias = $scope.mesTip2;
    };

    $scope.changeAdress3 = function () {
        $scope.add.alias = $scope.mesTip3;
    };

    //添加新地址
    $scope.addAddressList=function () {
        baseService.sendPost("/user/addAddressList",$scope.add).then(function (response) {
            if (response.data){
                alert("添加成功");
                $scope.findAddress();
            }
        })
    };
    $scope.showAddress=function () {
        baseService.sendGet("/user/showAddress?userId="+$scope.add.userId).then(function (response) {
            $scope.add=JSON.parse(JSON.stringify( response.data));
        });

    };

});