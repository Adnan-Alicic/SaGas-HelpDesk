module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Taskovi', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Taskovi', 'comment');
  }
};
