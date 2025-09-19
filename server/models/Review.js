const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transactionId: {
    type: DataTypes.UUID,
    references: {
      model: Transaction,
      key: 'id',
    },
    allowNull: false,
  },
  reviewerId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  revieweeId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// 建立关联关系
Review.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewerId' });
Review.belongsTo(User, { as: 'reviewee', foreignKey: 'revieweeId' });
Review.belongsTo(Transaction, { foreignKey: 'transactionId' });

User.hasMany(Review, { as: 'givenReviews', foreignKey: 'reviewerId' });
User.hasMany(Review, { as: 'receivedReviews', foreignKey: 'revieweeId' });
Transaction.hasOne(Review, { foreignKey: 'transactionId' });

module.exports = Review;