const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const MarketplaceProject = sequelize.define('MarketplaceProject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  demoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  repoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'sold', 'archived'),
    defaultValue: 'draft',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

// 建立与User的关联
MarketplaceProject.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(MarketplaceProject, { foreignKey: 'userId' });

module.exports = MarketplaceProject;