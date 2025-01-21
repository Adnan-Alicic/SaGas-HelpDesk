module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Taskovi', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sifra_taska: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      naziv_taska: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tekst_taska: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      prioritet: {
        type: Sequelize.ENUM('Urgentno', 'Visoki', 'Srednji', 'Niski'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('U toku', 'Završeno'),
        allowNull: false,
        defaultValue: 'U toku',
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Ovdje pretpostavljam da se vaša tabela za korisnike zove 'Users'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      verifikacija: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Taskovi');
  },
};
