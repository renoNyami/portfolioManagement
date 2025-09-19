const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const Transaction = require('./models/Transaction');
const MarketplaceProject = require('./models/MarketplaceProject');
const User = require('./models/User');

// 获取用户的交易记录（作为买家）
router.get('/transactions/buyer', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { buyerId: req.user.id },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: MarketplaceProject,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取用户的交易记录（作为卖家）
router.get('/transactions/seller', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { sellerId: req.user.id },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: MarketplaceProject,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 创建交易（购买项目）
router.post('/transactions', auth, async (req, res) => {
  const { projectId } = req.body;

  try {
    // 检查项目是否存在
    const project = await MarketplaceProject.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    // 检查项目是否已发布
    if (project.status !== 'published') {
      return res.status(400).json({ msg: 'Project is not available for purchase' });
    }
    
    // 检查用户不能购买自己的项目
    if (project.userId === req.user.id) {
      return res.status(400).json({ msg: 'You cannot buy your own project' });
    }

    const transaction = await Transaction.create({
      projectId,
      buyerId: req.user.id,
      sellerId: project.userId,
      amount: project.price,
    });
    
    // 更新项目状态为已售出
    project.status = 'sold';
    await project.save();
    
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取单个交易详情
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'avatarUrl', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'avatarUrl', 'email']
        },
        {
          model: MarketplaceProject,
          attributes: ['id', 'name', 'description', 'price']
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    // 检查用户是否有权限查看此交易
    if (transaction.buyerId !== req.user.id && transaction.sellerId !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;