package com.pinyougou.user.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.pinyougou.common.pojo.PageResult;
import com.pinyougou.pojo.Order;
import com.pinyougou.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Reference(timeout = 10000)
    private OrderService orderService;

    /** 根据用户ID查找用户所有的订单 */
    @PostMapping("/findOrderByUserId")
    public Map<String, Object> findOrderByUserId(@RequestBody Map<String,Object> searchParam ) {
        // System.out.println(userId);
        /** 创建Map集合封装返回数据 */
        Map<String,Object> data = new HashMap<>();
        /** 获取用户所有的订单 */
        PageResult pageResult = orderService.findOrderByUserId((String) searchParam.get("userId"),Integer.parseInt((String) searchParam.get("page")));
        data.put("orders",pageResult.getRows());
        data.put("totalPages",pageResult.getTotal()/3 + 1);
        return data;
    }
}
