const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Demand = sequelize.define('Demand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'open',
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  skills: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  timestamps: true,
});

// 建立与User的关联
Demand.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Demand, { foreignKey: 'userId' });

module.exports = Demand;