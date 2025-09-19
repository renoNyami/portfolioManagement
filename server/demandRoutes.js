const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const Demand = require('./models/Demand');
const User = require('./models/User');
const { Op } = require('sequelize');

// 获取所有开放的需求
router.get('/demands', auth, async (req, res) => {
  try {
    const { search, minBudget, maxBudget, skills } = req.query;
    
    const where = { status: 'open' };
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (minBudget) {
      where.budget = { ...where.budget, [Op.gte]: minBudget };
    }
    
    if (maxBudget) {
      where.budget = { ...where.budget, [Op.lte]: maxBudget };
    }
    
    const include = [{
      model: User,
      attributes: ['id', 'username', 'avatarUrl']
    }];
    
    const demands = await Demand.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(demands);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取用户发布的需求
router.get('/demands/my-demands', auth, async (req, res) => {
  try {
    const demands = await Demand.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(demands);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 发布新需求
router.post('/demands', auth, async (req, res) => {
  const { title, description, budget, deadline, skills } = req.body;

  try {
    const newDemand = await Demand.create({
      title,
      description,
      budget,
      deadline,
      skills,
      userId: req.user.id,
    });
    
    res.status(201).json(newDemand);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取单个需求详情
router.get('/demands/:id', auth, async (req, res) => {
  try {
    const demand = await Demand.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatarUrl', 'email']
      }]
    });
    
    if (!demand) {
      return res.status(404).json({ msg: 'Demand not found' });
    }
    
    res.json(demand);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 更新需求
router.put('/demands/:id', auth, async (req, res) => {
  const { title, description, budget, deadline, skills, status } = req.body;

  try {
    let demand = await Demand.findByPk(req.params.id);
    
    if (!demand || demand.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Demand not found or unauthorized' });
    }

    demand.title = title || demand.title;
    demand.description = description || demand.description;
    demand.budget = budget || demand.budget;
    demand.deadline = deadline || demand.deadline;
    demand.skills = skills || demand.skills;
    demand.status = status || demand.status;

    await demand.save();
    res.json(demand);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 删除需求
router.delete('/demands/:id', auth, async (req, res) => {
  try {
    const demand = await Demand.findByPk(req.params.id);
    
    if (!demand || demand.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Demand not found or unauthorized' });
    }

    await demand.destroy();
    res.json({ msg: 'Demand removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;