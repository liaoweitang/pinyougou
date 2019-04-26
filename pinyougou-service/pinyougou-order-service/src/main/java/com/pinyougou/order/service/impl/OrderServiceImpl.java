package com.pinyougou.order.service.impl;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.fastjson.JSONArray;
import com.github.pagehelper.ISelect;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.pinyougou.cart.Cart;
import com.pinyougou.common.pojo.PageResult;
import com.pinyougou.common.util.IdWorker;
import com.pinyougou.mapper.*;
import com.pinyougou.pojo.*;
import com.pinyougou.service.GoodsService;
import com.pinyougou.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.transaction.annotation.Transactional;
import tk.mybatis.mapper.entity.Example;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;

/**
 * 订单服务接口实现类
 *
 * @author lee.siu.wah
 * @version 1.0
 * <p>File Created at 2019-04-20<p>
 */
@Service(interfaceName = "com.pinyougou.service.OrderService")
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private OrderItemMapper orderItemMapper;
    @Autowired
    private RedisTemplate redisTemplate;
    @Autowired
    private IdWorker idWorker;
    @Autowired
    private PayLogMapper payLogMapper;
    @Autowired
    private ItemMapper itemMapper;
    @Autowired
    private SellerMapper sellerMapper;

    @Override
    public void save(Order order) {
        try {

            // 获取该用户的购物车
            List<Cart> cartList = (List<Cart>) redisTemplate
                    .boundValueOps("cart_" + order.getUserId()).get();

            // 定义支付的总金额
            double totalMoney = 0;
            // 定义订单号
            String orderIds = "";

            // 一个Cart代表一个商家的购物车，产生一个订单
            for (Cart cart : cartList) {
                // 创建订单对象
                Order order1 = new Order();
                // 生成订单id
                long orderId = idWorker.nextId();
                // 设置订单id
                order1.setOrderId(orderId);
                // 订单支付方式
                order1.setPaymentType(order.getPaymentType());
                // 订单支付状态码: 未付款
                order1.setStatus("1");
                // 订单创建时间
                order1.setCreateTime(new Date());
                // 订单修改时间
                order1.setUpdateTime(order1.getCreateTime());
                // 订单关联的用户
                order1.setUserId(order.getUserId());
                // 订单收件地址
                order1.setReceiverAreaName(order.getReceiverAreaName());
                // 订单收件人手机号码
                order1.setReceiverMobile(order.getReceiverMobile());
                // 订单收件人姓名
                order1.setReceiver(order.getReceiver());
                // 订单的来源
                order1.setSourceType(order.getSourceType());
                // 订单关联的商家id
                order1.setSellerId(cart.getSellerId());


                // 定义订单总金额
                double money = 0;

                // 迭代商家购物车中的商品
                for (OrderItem orderItem : cart.getOrderItems()) {
                    // 设置主键id
                    orderItem.setId(idWorker.nextId());
                    // 设置关联的订单id
                    orderItem.setOrderId(orderId);

                    // 计算订单的总金额
                    money += orderItem.getTotalFee().doubleValue();

                    // 往tb_order_item表插入数据
                    orderItemMapper.insertSelective(orderItem);
                }

                // 多个订单累加(支付总金额)
                totalMoney += money;
                // 拼接多个订单号
                orderIds += orderId + ",";

                // 订单支付的总金额
                order1.setPayment(new BigDecimal(money));
                // 往tb_order表插入数据
                orderMapper.insertSelective(order1);
            }

            // 生成支付日志(多个订单生成一次支付)
            if ("1".equals(order.getPaymentType())) { // 在线支付
                PayLog payLog = new PayLog();
                // 交易订单号
                payLog.setOutTradeNo(String.valueOf(idWorker.nextId()));
                // 创建时间
                payLog.setCreateTime(new Date());
                // 支付总金额
                payLog.setTotalFee((long) (totalMoney * 100));
                // 支付用户
                payLog.setUserId(order.getUserId());
                // 交易状态: 未支付
                payLog.setTradeState("0");
                // 多个订单号，中间用逗号分隔
                payLog.setOrderList(orderIds.substring(0, orderIds.length() - 1));
                // 支付类型
                payLog.setPayType(order.getPaymentType());

                // 往支付日志表中插入数据
                payLogMapper.insertSelective(payLog);

                // 把最新需要支付的日志存入Redis
                redisTemplate.boundValueOps("payLog_" + order.getUserId()).set(payLog);
            }


            // 删除Redis中购物车数据
            redisTemplate.delete("cart_" + order.getUserId());

        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public void update(Order order) {

    }

    @Override
    public void delete(Serializable id) {

    }

    @Override
    public void deleteAll(Serializable[] ids) {

    }

    @Override
    public Order findOne(Serializable id) {
        return null;
    }

    @Override
    public List<Order> findAll() {
        return null;
    }

    @Override
    public List<Order> findByPage(Order order, int page, int rows) {
        return null;
    }

    /**
     * 从Redis数据库中获取支付日志
     */
    public PayLog findPayLogFromRedis(String userId) {
        try {
            return (PayLog) redisTemplate.boundValueOps("payLog_" + userId).get();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    /**
     * 支付成功，修改支付日志的状态、订单的状态
     */
    public void updatePayStatus(String outTradeNo, String transactionId) {
        try {
            // 1. 修改支付日志状态
            PayLog payLog = payLogMapper.selectByPrimaryKey(outTradeNo);
            // 支付时间
            payLog.setPayTime(new Date());
            // 支付状态 : 支付成功
            payLog.setTradeState("1");
            // 微信支付订单号
            payLog.setTransactionId(transactionId);
            // 修改
            payLogMapper.updateByPrimaryKeySelective(payLog);

            // 2. 修改订单的状态
            // 获取多个订单
            String[] orderIds = payLog.getOrderList().split(",");
            for (String orderId : orderIds) {
                Order order = new Order();
                order.setOrderId(Long.valueOf(orderId));
                // 已付款
                order.setStatus("2");
                // 支付时间
                order.setPaymentTime(payLog.getPayTime());
                // 修改
                orderMapper.updateByPrimaryKeySelective(order);
            }

            // 3. 从Redis数据库删除支付日志
            redisTemplate.delete("payLog_" + payLog.getUserId());

        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    public PageResult findOrderByUserId(String userId,Integer page) {

        PageInfo<Order> pageInfo = PageHelper.startPage(page, 3).doSelectPageInfo(new ISelect() {
            @Override
            public void doSelect() {
                Example example = new Example(Order.class);
                // 创建条件对象
                Example.Criteria criteria = example.createCriteria();
                // 添加条件
                criteria.andEqualTo("userId", userId);
                // 条件查询
                List<Order> orderList = orderMapper.selectByExample(example);
                // 遍历订单列表,根据订单id查询订单详细信息
                for (Order order : orderList) {
                    if (order.getPostFee() == null) {
                        order.setPostFee("0.00");
                    }
                    Example example1 = new Example(OrderItem.class);
                    // 创建条件对象
                    Example.Criteria criteria1 = example1.createCriteria();
                    criteria1.andEqualTo("orderId", order.getOrderId());
                    List<OrderItem> orderItems = orderItemMapper.selectByExample(example1);
                    // 封装规格名称
                    for (OrderItem orderItem : orderItems) {
                        Item item = itemMapper.selectByPrimaryKey(orderItem.getItemId());
                        orderItem.setSpec(item.getSpec());
                    }
                    order.setOrderItems(orderItems);
                    // 封装店铺名称
                    Seller seller = sellerMapper.selectByPrimaryKey(order.getSellerId());
                    order.setSellerId(seller.getNickName());
                }
            }
        });

        return new PageResult(pageInfo.getTotal(),pageInfo.getList());
    }
}
