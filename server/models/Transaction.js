const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const MarketplaceProject = require('./MarketplaceProject');
const Order = require('./Order');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    references: {
      model: MarketplaceProject,
      key: 'id',
    },
    allowNull: true,
  },
  orderId: {
    type: DataTypes.UUID,
    references: {
      model: Order,
      key: 'id',
    },
    allowNull: true,
  },
  buyerId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  sellerId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// 建立关联关系
Transaction.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Transaction.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
Transaction.belongsTo(MarketplaceProject, { foreignKey: 'projectId' });
Transaction.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Transaction, { as: 'buyerTransactions', foreignKey: 'buyerId' });
User.hasMany(Transaction, { as: 'sellerTransactions', foreignKey: 'sellerId' });
MarketplaceProject.hasMany(Transaction, { foreignKey: 'projectId' });
Order.hasMany(Transaction, { foreignKey: 'orderId' });

module.exports = Transaction;