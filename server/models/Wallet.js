const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
    unique: true,
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'CNY',
  },
}, {
  timestamps: true,
});

// 建立与User的关联
Wallet.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Wallet, { foreignKey: 'userId' });

module.exports = Wallet;