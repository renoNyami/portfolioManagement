console.log('server.js is being executed');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const sequelize = require('./config/database');
const { syncModels } = require('./config/database');
const User = require('./models/User');
const Project = require('./models/Project');
const Demand = require('./models/Demand');
const Order = require('./models/Order');
const MarketplaceProject = require('./models/MarketplaceProject');
const Transaction = require('./models/Transaction');
const Review = require('./models/Review');
const Wallet = require('./models/Wallet');
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
const commentRoutes = require('./commentRoutes');
const communityRoutes = require('./communityRoutes');
const aiRoutes = require('./aiRoutes');
const demandRoutes = require('./demandRoutes');
const orderRoutes = require('./orderRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const transactionRoutes = require('./transactionRoutes');
const walletRoutes = require('./walletRoutes');
// 移除对paymentRoutes的引用，因为我们已经删除了这个文件

// Test GET route
app.get('/test', (req, res) => {
  res.send('Test GET route works!');
});

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', projectRoutes);
app.use('/api', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', demandRoutes);
app.use('/api', orderRoutes);
app.use('/api', marketplaceRoutes);
app.use('/api', transactionRoutes);
app.use('/api', walletRoutes);
// 移除对paymentRoutes的使用，因为我们已经删除了这个文件

const PORT = process.env.PORT || 5000;
syncModels().then(() => {
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    wss.on('connection', ws => {
      console.log('Client connected');

      ws.on('message', message => {
        console.log(`Received: ${message}`);
        // Echo back message to client
        ws.send(`Server received: ${message}`);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });

      ws.on('error', error => {
        console.error('WebSocket error:', error);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });