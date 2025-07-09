const express = require('express');
const Project = require('./models/Project');
const auth = require('./middleware/auth'); // Assuming you'll create an auth middleware

const router = express.Router();

// Get all projects for a user
const User = require('./models/User'); // 引入 User 模型

// Get all projects with search and filter options
router.get('/projects', auth, async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const include = [{
      model: User,
      attributes: ['email', 'username']
    }];
    
    if (category === 'my') {
      where.userId = req.user.id;
    }
    
    const projects = await Project.findAll({
      where,
      include
    });
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get projects by user ID
router.get('/users/:userId/projects', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: User,
        attributes: ['email', 'username']
      }]
    });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/projects/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['email', 'username']
      }]
    });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a single project by ID
router.get('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['email', 'username']
      }]
    });
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add a new project
router.post('/projects', auth, async (req, res) => {
  const { name, demoUrl, repoUrl, description } = req.body;

  try {
    const newProject = await Project.create({
      name,
      demoUrl,
      repoUrl,
      description,
      userId: req.user.id,
    });
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a project
router.put('/projects/:id', auth, async (req, res) => {
  const { name, demoUrl, repoUrl, description } = req.body;

  try {
    let project = await Project.findByPk(req.params.id);
    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Project not found or unauthorized' });
    }

    project.name = name || project.name;
    project.demoUrl = demoUrl || project.demoUrl;
    project.repoUrl = repoUrl || project.repoUrl;
    project.description = description || project.description;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a project
router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
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