module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Dodaj novu kolonu validacija tipa BOOLEAN
    await queryInterface.addColumn('PrijavaSmetnji', 'validacija', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Postavi podrazumijevanu vrijednost
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Ako se migracija vrati unazad, ukloni novu kolonu
    await queryInterface.removeColumn('PrijavaSmetnji', 'validacija');
  }
};
