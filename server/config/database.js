// config/database.js
const { Sequelize } = require('sequelize');

// 从环境变量获取配置（确保已正确加载）
const mysqlConfig = {
  database: process.env.MYSQL_DATABASE || `user_management_db`,
  username: process.env.MYSQL_USER || 'root', // 设默认值为 root
  password: process.env.MYSQL_PASSWORD || 'sql2008', // 无密码时为空
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  dialect: 'mysql',
  logging: false,
};

// 显式传递配置对象
const sequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.username,
  mysqlConfig.password,
  {
    ...mysqlConfig,
    // 添加 authDatabase 解决无密码连接问题（可选）
    authDatabase: 'mysql',
  }
);

module.exports = sequelize;