const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const AIProject = sequelize.define('AIProject', {
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
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  techStack: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  aiModel: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'gpt-4',
  },
  apiProvider: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'openai',
  },
  status: {
    type: DataTypes.ENUM('generated', 'deployed', 'archived'),
    defaultValue: 'generated',
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
});

// 建立与User的关联
AIProject.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(AIProject, { foreignKey: 'userId' });

module.exports = AIProject;