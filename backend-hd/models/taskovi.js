module.exports = (sequelize, DataTypes) => {
    const Taskovi = sequelize.define('Taskovi', {
        sifra_taska: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        naziv_taska: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tekst_taska: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        prioritet: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            },
            allowNull: false,
        },
        sector: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        verifikacija: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        prijavaSmetnjiId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'PrijavaSmetnji',
                key: 'id'
            },
            allowNull: true, // Može biti null ako task nije vezan za prijavu smetnji
        },

        comment: {
            type: DataTypes.TEXT,  // Dodaj kolonu comment
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        }
    }, {
        tableName: 'Taskovi', // Tačno ime tabele
        freezeTableName: true, // Sprječava automatsko mijenjanje imena tabele
    });

    Taskovi.associate = function(models) {
        Taskovi.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
        Taskovi.belongsTo(models.PrijavaSmetnji, { foreignKey: 'prijavaSmetnjiId', as: 'PrijavaSmetnji' });
    };

    // Automatsko postavljanje sektora
    Taskovi.beforeCreate(async(task, options) => {
        const user = await sequelize.models.User.findByPk(task.userId);
        if (user && user.sector) {
            task.sector = user.sector; // Automatski postavi sektor
        } else {
            throw new Error('Korisnik nema definisan sektor.');
        }
    });

    return Taskovi;
};