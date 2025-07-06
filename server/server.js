console.log('server.js is being executed');
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Project = require('./models/Project');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: envPath });

// Log environment variables (for debugging)


const app = express();

app.use(session({
  secret: process.env.JWT_SECRET, // Use a strong secret from your .env
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using https
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Create database if it doesn't exist
const mysql = require('mysql2/promise');
async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'sql2008',
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`);
  await connection.end();
}

// Test database connection
createDatabaseIfNotExists()
  .then(() => sequelize.authenticate())
  .then(() => console.log('MySQL connection successful'))
  .catch(err => {
    console.error('MySQL connection failed:', err);
    process.exit(1);
  });

// Sync database models
// Define routes
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const projectRoutes = require('./projectRoutes');
const userRoutes = require('./userRoutes');

// Test GET route
app.get('/test', (req, res) => {
  res.send('Test GET route works!');
});

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', projectRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
    console.log('Database & tables created!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });