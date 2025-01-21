'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Prvo uklonimo postojeću kolonu validacija
    await queryInterface.removeColumn('PrijavaSmetnji', 'validacija');
  },

  down: async (queryInterface, Sequelize) => {
    // Ako se migracija vrati unazad, vratimo staru kolonu (opciono)
    await queryInterface.addColumn('PrijavaSmetnji', 'validacija', {
      type: Sequelize.STRING, // ili njen prethodni tip
    });
  }
};
