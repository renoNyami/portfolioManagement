const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const CommunityPost = require('./models/CommunityPost');
const User = require('./models/User');

// Get all community posts
router.get('/community/posts', auth, async (req, res) => {
  try {
    const posts = await CommunityPost.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new community post
router.post('/community/posts', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    const newPost = await CommunityPost.create({
      title,
      content,
      userId: req.user.id,
    });
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a single community post by ID
router.get('/community/posts/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'username']
      }]
    });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a community post
router.put('/community/posts/:id', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    let post = await CommunityPost.findByPk(req.params.id);
    if (!post || post.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Post not found or unauthorized' });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a community post
router.delete('/community/posts/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post || post.userId !== req.user.id) {
      return res.status(404).json({ msg: 'Post not found or unauthorized' });
    }

    await post.destroy();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
