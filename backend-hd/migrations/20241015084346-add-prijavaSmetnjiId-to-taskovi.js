module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Taskovi', 'prijavaSmetnjiId', {
          type: Sequelize.INTEGER,
          references: {
              model: 'PrijavaSmetnji', // Tačno ime tabele
              key: 'id'
          },
          allowNull: true, // Može biti null ako task nije vezan za prijavu smetnji
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Taskovi', 'prijavaSmetnjiId');
  }
};
