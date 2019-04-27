package com.pinyougou.user.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pinyougou.pojo.*;
import com.pinyougou.service.*;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户控制器
 *
 * @author lee.siu.wah
 * @version 1.0
 * <p>File Created at 2019-04-15<p>
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Reference(timeout = 10000)
    private ProvincesService provincesService;
    @Reference(timeout = 10000)
    private UserService userService;
    @Reference(timeout = 10000)
    private CitiesService citiesService;
    @Reference(timeout = 10000)
    private AreasService areasService;
    @Reference(timeout = 10000)
    private AddressService addressService;

    /**
     * 用户注册
     */
    @PostMapping("/save")
    public boolean save(@RequestBody User user, String code) {
        try {
            // 检验验证码是否正确
            boolean flag = userService.checkSmsCode(user.getPhone(), code);
            if (flag) {
                userService.save(user);
            }
            return flag;
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return false;
    }


    /**
     * 发送短信验证码
     */
    @GetMapping("/sendSmsCode")
    public boolean sendSmsCode(String phone) {
        try {
            return userService.sendSmsCode(phone);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return false;
    }

    @GetMapping("/findName")
    public Map<String, String> showName() {

        // 获取安全上下文对象
        SecurityContext context = SecurityContextHolder.getContext();
        String loginName = context.getAuthentication().getName();

        Map<String, String> data = new HashMap<>();
        data.put("loginName", loginName);
        return data;
    }

    @GetMapping("/findProvincesList")
    public List<Provinces> findProvince() {
        return provincesService.findAll();
    }

    @GetMapping("/findCityList")
    public List<Cities> findCityByProvinceId(@RequestParam String provinceId) {
        return citiesService.findCityByProvinceId(provinceId);
    }

    @GetMapping("/findAreasList")
    public List<Areas> findAreasByCityId(@RequestParam String cityId) {
        return areasService.findAreasByCityId(cityId);

    }

    @PostMapping("/saveOrUpData")
    public boolean saveOrUpData(HttpServletRequest request, @RequestBody User users) {
        try {
            String username = request.getRemoteUser();
            users.setUsername(username);
            userService.saveOrUpData(users);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;

    }

    ;

    @GetMapping("/findReload")
    public User findReload(HttpServletRequest request) {
        String username = request.getRemoteUser();
        return userService.findUsersByuserName(username);
    }

    @GetMapping("/addPic")
    public boolean addPic(HttpServletRequest request, String headPic) {
        String remoteUser = request.getRemoteUser();
        return userService.addPic(remoteUser, headPic);
    }

    //查询用户所有地址
    @GetMapping("/findAddress")
    public List<Address> findAddress() {
        // 获取登录用户名id
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return addressService.findAddressByUser(userId);
    }

    //添加新地址
    @PostMapping("/addAddressList")
    public boolean addAddressList(@RequestBody Address add) {
        try {
            // 获取登录用户名id
            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            add.setUserId(userId);
            addressService.addAddress(add);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

}