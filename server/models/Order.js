const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Demand = require('./Demand');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  demandId: {
    type: DataTypes.UUID,
    references: {
      model: Demand,
      key: 'id',
    },
    allowNull: false,
  },
  freelancerId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  clientIdId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'),
    defaultValue: 'pending',
  },
  deliveryTime: {
    type: DataTypes.INTEGER, // 预计交付时间（天）
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// 建立关联关系
Order.belongsTo(User, { as: 'freelancer', foreignKey: 'freelancerId' });
Order.belongsTo(User, { as: 'client', foreignKey: 'clientIdId' });
Order.belongsTo(Demand, { foreignKey: 'demandId' });

User.hasMany(Order, { as: 'freelancerOrders', foreignKey: 'freelancerId' });
User.hasMany(Order, { as: 'clientOrders', foreignKey: 'clientIdId' });
Demand.hasMany(Order, { foreignKey: 'demandId' });

module.exports = Order;