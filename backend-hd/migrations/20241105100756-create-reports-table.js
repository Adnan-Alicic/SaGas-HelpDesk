module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reports', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      task_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Taskovi',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      complaint_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'PrijavaSmetnji',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      validation: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      verification: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reports');
  },
};
