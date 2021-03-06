package com.pinyougou.shop.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.pinyougou.pojo.Seller;
import com.pinyougou.service.SellerService;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * 商家控制器
 *
 * @author lee.siu.wah
 * @version 1.0
 * <p>File Created at 2019-04-01<p>
 */
@RestController
@RequestMapping("/seller")
public class SellerController {

    @Reference(timeout = 10000)
    private SellerService sellerService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    /** 商家申请入驻 */
    @PostMapping("/save")
    public boolean save(@RequestBody Seller seller){
        try{
            String password = passwordEncoder.encode(seller.getPassword());
            seller.setPassword(password);
            sellerService.save(seller);
            return true;
        }catch (Exception ex){
            ex.printStackTrace();
        }
        return false;
    }

    /** 商家信息查询 */
    @GetMapping("/findOne")
    public Seller findAll(){
        String sellerId = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return sellerService.findOne(sellerId);
    }

    /** 商家信息修改 */
    @PostMapping("/update")
    public boolean update(@RequestBody Seller seller){
        String sellerId = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        seller.setSellerId(sellerId);
        try{
            sellerService.update(seller);
            return true;
        }catch (Exception ex){
            ex.printStackTrace();
        }
        return false;
    }
   //商家查询原密码
    @PostMapping("/findOldPassword")
    public boolean findOldPassword(String oldPassword) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        // 获取登录用户名
        String sellerId = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        Seller seller = sellerService.findOne(sellerId);
        String password = seller.getPassword();


        boolean matches = encoder.matches(oldPassword,password);
        return matches;
    }
    //商家修改密码
    @PostMapping("/updatePassword")
    public boolean updatePassword(String newPassword) {
        try {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            // 获取登录用户名
            String sellerId = SecurityContextHolder.getContext()
                    .getAuthentication().getName();

            Seller seller = sellerService.findOne(sellerId);
            //加密修改密码
            seller.setPassword(encoder.encode(newPassword));
            sellerService.update(seller);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

}
