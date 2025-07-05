const express = require('express');
const User = require('./models/User');
const auth = require('./middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure multer to save files to the 'uploads/' directory

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { 
        exclude: ['password', 'githubId'] 
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      msg: '服务器错误'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  const { username, jobTitle, bio } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: '用户不存在'
      });
    }

    // Only update allowed fields
    if (username) user.username = username;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      data: {
        username: user.username,
        jobTitle: user.jobTitle,
        bio: user.bio,
        email: user.email,
        avatarUrl: user.avatarUrl // Still include avatarUrl in the response
      }
    });
  } catch (err) {
    console.error(err.message);
    console.error(err); // Add this line to log the full error object

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        msg: '用户名已被使用'
      });
    }

    res.status(500).json({
      success: false,
      msg: '服务器错误'
    });
  }
});

// Handle avatar upload
router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: '请上传头像文件'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: '用户不存在'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({
      success: true,
      data: {
        avatarUrl: avatarUrl
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      msg: '服务器错误'
    });
  }
});

module.exports = router;