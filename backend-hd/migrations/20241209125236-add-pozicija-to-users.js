'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'pozicija', {
      type: Sequelize.STRING,
      allowNull: true, // Postavite na false ako je obavezno
      defaultValue: 'User', // Opcionalna podrazumevana vrednost
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'pozicija');
  }
};
