const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const MarketplaceProject = require('./models/MarketplaceProject');
const User = require('./models/User');

// 获取所有发布的项目
router.get('/marketplace/projects', auth, async (req, res) => {
  try {
    const { search, minPrice, maxPrice, category } = req.query;
    
    const where = { status: 'published' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (minPrice) {
      where.price = { ...where.price, [Op.gte]: minPrice };
    }
    
    if (maxPrice) {
      where.price = { ...where.price, [Op.lte]: maxPrice };
    }
    
    if (category) {
      where.category = category;
    }
    
    const include = [{
      model: User,
      attributes: ['id', 'username', 'avatarUrl']
    }];
    
    const projects = await MarketplaceProject.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取用户发布的项目
router.get('/marketplace/my-projects', auth, async (req, res) => {
  try {
    const projects = await MarketplaceProject.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 发布新项目
router.post('/marketplace/projects', auth, async (req, res) => {
  const { name, description, price, demoUrl, repoUrl, category, tags } = req.body;

  try {
    const newProject = await MarketplaceProject.create({
      name,
      description,
      price,
      demoUrl,
      repoUrl,
      category,
      tags,
      userId: req.user.id,
    });
    
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 获取单个项目详情
router.get('/marketplace/projects/:id', auth, async (req, res) => {
  try {
    const project = await MarketplaceProject.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatarUrl', 'email']
      }]
    });
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    // 如果项目未发布，只有所有者可以查看
    if (project.status !== 'published' && project.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 更新项目
router.put('/marketplace/projects/:id', auth, async (req, res) => {
  const { name, description, price, demoUrl, repoUrl, category, tags, status } = req.body;

  try {
    let project = await MarketplaceProject.findByPk(req.params.id);
    
    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Project not found or unauthorized' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.price = price || project.price;
    project.demoUrl = demoUrl || project.demoUrl;
    project.repoUrl = repoUrl || project.repoUrl;
    project.category = category || project.category;
    project.tags = tags || project.tags;
    project.status = status || project.status;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 删除项目
router.delete('/marketplace/projects/:id', auth, async (req, res) => {
  try {
    const project = await MarketplaceProject.findByPk(req.params.id);
    
    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Project not found or unauthorized' });
    }

    await project.destroy();
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;