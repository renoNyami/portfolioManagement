const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const Wallet = require('./models/Wallet');
const Transaction = require('./models/Transaction');

// 获取用户钱包信息
router.get('/wallet', auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    
    if (!wallet) {
      // 如果钱包不存在，创建一个新钱包
      wallet = await Wallet.create({
        userId: req.user.id,
        balance: 0.00
      });
    }
    
    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取用户的交易记录
router.get('/wallet/transactions', auth, async (req, res) => {
  try {
    // 获取作为买家的交易
    const buyerTransactions = await Transaction.findAll({
      where: { buyerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    // 获取作为卖家的交易
    const sellerTransactions = await Transaction.findAll({
      where: { sellerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    // 合并并格式化交易记录
    const transactions = [
      ...buyerTransactions.map(t => ({
        ...t.toJSON(),
        type: 'expense',
        description: `购买项目: ${t.projectId ? '项目' : '服务'}`
      })),
      ...sellerTransactions.map(t => ({
        ...t.toJSON(),
        type: 'income',
        description: `出售项目: ${t.projectId ? '项目' : '服务'}`
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 充值
router.post('/wallet/deposit', auth, async (req, res) => {
  const { amount } = req.body;

  try {
    // 验证金额
    if (amount <= 0) {
      return res.status(400).json({ msg: '充值金额必须大于0' });
    }

    // 获取或创建钱包
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user.id,
        balance: 0.00
      });
    }

    // 更新余额
    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
    await wallet.save();

    res.json({ msg: '充值成功', balance: wallet.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 提现
router.post('/wallet/withdraw', auth, async (req, res) => {
  const { amount } = req.body;

  try {
    // 验证金额
    if (amount <= 0) {
      return res.status(400).json({ msg: '提现金额必须大于0' });
    }

    // 获取钱包
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(400).json({ msg: '钱包不存在' });
    }

    // 检查余额
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ msg: '余额不足' });
    }

    // 更新余额
    wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
    await wallet.save();

    res.json({ msg: '提现成功', balance: wallet.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;