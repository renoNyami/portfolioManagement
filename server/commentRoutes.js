const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const Comment = require('./models/Comment');
const Project = require('./models/Project');
const User = require('./models/User');

// 添加评论
router.post('/projects/:projectId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const project = await Project.findByPk(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ msg: '项目不存在' });
    }
    
    const comment = await Comment.create({
      content,
      userId: req.user.id,
      projectId: req.params.projectId
    });
    
    res.status(201).json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 获取项目评论
router.get('/projects/:projectId/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { projectId: req.params.projectId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: '服务器错误' });
  }
});

module.exports = router;