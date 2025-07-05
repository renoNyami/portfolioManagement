const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const router = express.Router();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { githubId: profile.id } });

      if (user) {
        return done(null, user);
      } else {
        user = await User.create({
          githubId: profile.id,
          username: profile.username,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          // You might want to set a default password or handle it differently for OAuth users
          password: null // Or a generated password
        });
        return done(null, user);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] } // 不返回密码字段
    });
    
    if (!user) {
      return done(null, false);
    }
    
    // 对于标准登录用户，确保不强制要求 githubId
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Register
// 修改注册路由
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    
    // 从请求体获取数据
    const { email, password } = req.body;
    let { username } = req.body;

    if (!username) {
      username = email; // Default username to full email address
    }

    // 确保username不是空字符串，如果为空则设置为null以匹配模型定义
    if (username === '') {
      username = null;
    }

    // 验证必填字段
    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: '邮箱和密码是必填项'
      });
    }

    // 检查密码是否为空字符串
    if (password === '') {
      console.log('Password cannot be empty');
      return res.status(400).json({
        success: false,
        message: '密码不能为空'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ 
        success: false,
        message: '该邮箱已被注册' 
      });
    }

    // 哈希密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log('User created successfully:', user.id);

    // 生成JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      success: true,
      message: '注册成功',
      token 
    });

  } catch (err) {
    console.error('Registration error:', {
      error: err,
      stack: err.stack,
      requestBody: req.body
    });
    
    res.status(500).json({ 
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: '用户不存在' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: '密码不正确' });
    }

    // Generate JWT
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error during login process:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard page
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

module.exports = router;
