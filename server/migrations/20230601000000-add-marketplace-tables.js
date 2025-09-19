'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建需求表
    await queryInterface.createTable('Demands', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'open',
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      skills: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建订单表
    await queryInterface.createTable('Orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      demandId: {
        type: Sequelize.UUID,
        references: {
          model: 'Demands',
          key: 'id',
        },
        allowNull: false,
      },
      freelancerId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      clientIdId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'),
        defaultValue: 'pending',
      },
      deliveryTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建市场项目表
    await queryInterface.createTable('MarketplaceProjects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      demoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      repoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'sold', 'archived'),
        defaultValue: 'draft',
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tags: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建交易表
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      projectId: {
        type: Sequelize.UUID,
        references: {
          model: 'MarketplaceProjects',
          key: 'id',
        },
        allowNull: true,
      },
      orderId: {
        type: Sequelize.UUID,
        references: {
          model: 'Orders',
          key: 'id',
        },
        allowNull: true,
      },
      buyerId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      sellerId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建评价表
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      transactionId: {
        type: Sequelize.UUID,
        references: {
          model: 'Transactions',
          key: 'id',
        },
        allowNull: false,
      },
      reviewerId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      revieweeId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建钱包表
    await queryInterface.createTable('Wallets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: false,
        unique: true,
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表（逆向操作）
    await queryInterface.dropTable('Reviews');
    await queryInterface.dropTable('Transactions');
    await queryInterface.dropTable('MarketplaceProjects');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Demands');
    await queryInterface.dropTable('Wallets');
  }
};