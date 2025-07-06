const express = require('express');
const router = express.Router();
const User = require('./models/User'); // Assuming you have a User model
const auth = require('./middleware/auth'); // Assuming you have an auth middleware

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'email'] }); // Only fetch necessary user data
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['id', 'username', 'email'] });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;