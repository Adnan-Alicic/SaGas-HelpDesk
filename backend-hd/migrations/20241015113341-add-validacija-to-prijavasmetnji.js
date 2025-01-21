module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PrijavaSmetnji', 'validacija', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PrijavaSmetnji', 'validacija');
  }
};
