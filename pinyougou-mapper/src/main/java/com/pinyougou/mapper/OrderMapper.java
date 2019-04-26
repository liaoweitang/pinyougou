package com.pinyougou.mapper;

import tk.mybatis.mapper.common.Mapper;

import com.pinyougou.pojo.Order;

import java.util.List;
import java.util.Map;

/**
 * OrderMapper 数据访问接口
 * @date 2019-03-28 09:54:28
 * @version 1.0
 * o.create_time createTime,o.order_id orderId,s.name sellerId,oi.pic_path picPath,
 * oi.title title,gd.specification_items spec,g.price prePrice,oi.price price,
 * o.payment payment,oi.total_fee totalFee,oi.num num,o.status status,o.post_fee postFee
 *
 */
public interface OrderMapper extends Mapper<Order>{


    Map<String,Object> findOrderByUserId(String userId);
}

