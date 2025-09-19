const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const Order = require('./models/Order');
const Demand = require('./models/Demand');
const User = require('./models/User');

// 获取用户作为自由职业者的所有订单
router.get('/orders/freelancer', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { freelancerId: req.user.id },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: Demand,
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取用户作为客户的所有订单
router.get('/orders/client', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { clientIdId: req.user.id },
      include: [
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: Demand,
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 创建新订单（承接需求）
router.post('/orders', auth, async (req, res) => {
  const { demandId, price, deliveryTime, message } = req.body;

  try {
    // 检查需求是否存在
    const demand = await Demand.findByPk(demandId);
    if (!demand) {
      return res.status(404).json({ msg: 'Demand not found' });
    }
    
    // 检查需求是否开放
    if (demand.status !== 'open') {
      return res.status(400).json({ msg: 'Demand is not open for bidding' });
    }
    
    // 检查用户不能承接自己的需求
    if (demand.userId === req.user.id) {
      return res.status(400).json({ msg: 'You cannot bid on your own demand' });
    }

    const newOrder = await Order.create({
      demandId,
      freelancerId: req.user.id,
      clientIdId: demand.userId,
      price,
      deliveryTime,
      message,
    });
    
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取单个订单详情
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatarUrl', 'email']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'avatarUrl', 'email']
        },
        {
          model: Demand,
          attributes: ['id', 'title', 'description']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // 检查用户是否有权限查看此订单
    if (order.freelancerId !== req.user.id && order.clientIdId !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 更新订单状态
router.put('/orders/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // 检查用户是否有权限更新此订单状态
    if (order.freelancerId !== req.user.id && order.clientIdId !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 删除订单
router.delete('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // 检查用户是否有权限删除此订单
    if (order.freelancerId !== req.user.id && order.clientIdId !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    
    // 只能删除状态为pending的订单
    if (order.status !== 'pending') {
      return res.status(400).json({ msg: 'Only pending orders can be deleted' });
    }

    await order.destroy();
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;