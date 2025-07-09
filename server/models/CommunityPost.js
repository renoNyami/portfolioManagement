const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const CommunityPost = sequelize.define('CommunityPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
});

CommunityPost.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CommunityPost, { foreignKey: 'userId' });

module.exports = CommunityPost;