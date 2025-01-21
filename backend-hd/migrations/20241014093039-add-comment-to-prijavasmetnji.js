module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PrijavaSmetnji', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true, // Komentar može biti prazan
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PrijavaSmetnji', 'comment');
  }
};
